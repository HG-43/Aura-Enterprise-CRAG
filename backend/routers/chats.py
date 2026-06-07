import asyncio
import json
import sys
import threading
from pathlib import Path
from queue import Empty, Queue

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.database import get_db
from backend.dependencies import get_current_user
from backend.models import Chat, Message, User
from backend.schemas import (
    ChatCreate,
    ChatDetailResponse,
    ChatResponse,
    ChatUpdate,
    MessageResponse,
    SendMessageRequest,
)
from graph import app as crag_app
from nodes import set_stream_callback

router = APIRouter(prefix="/api/chats", tags=["chats"])

PIPELINE_STEPS = ["retrieve", "grade_documents", "web_search_node", "generate_node"]
STATUS_MESSAGES = {
    "retrieve": "Searching internal knowledge base",
    "grade_documents": "Evaluating document relevance",
    "web_search_node": "Fetching live web intelligence",
    "generate_node": "Generating response",
}


def _parse_sources(raw: str | None) -> list[str] | None:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _message_response(msg: Message) -> MessageResponse:
    return MessageResponse(
        id=msg.id,
        role=msg.role,
        content=msg.content,
        sources=_parse_sources(msg.sources),
        created_at=msg.created_at,
    )


@router.get("", response_model=list[ChatResponse])
def list_chats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(Chat.user_id == user.id).order_by(Chat.updated_at.desc()).all()
    return [ChatResponse.model_validate(c) for c in chats]


@router.post("", response_model=ChatResponse, status_code=201)
def create_chat(payload: ChatCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = Chat(user_id=user.id, title=payload.title or "New conversation")
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return ChatResponse.model_validate(chat)


@router.get("/{chat_id}", response_model=ChatDetailResponse)
def get_chat(chat_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return ChatDetailResponse(
        id=chat.id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        messages=[_message_response(m) for m in chat.messages],
    )


@router.patch("/{chat_id}", response_model=ChatResponse)
def update_chat(
    chat_id: str,
    payload: ChatUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.title = payload.title
    db.commit()
    db.refresh(chat)
    return ChatResponse.model_validate(chat)


@router.delete("/{chat_id}")
def delete_chat(chat_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted"}


@router.post("/{chat_id}/messages")
async def send_message(
    chat_id: str,
    payload: SendMessageRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    user_msg = Message(chat_id=chat.id, role="user", content=payload.content.strip())
    db.add(user_msg)
    if chat.title == "New conversation":
        chat.title = payload.content.strip()[:60] + ("…" if len(payload.content) > 60 else "")
    db.commit()

    question = payload.content.strip()

    async def event_stream():
        event_queue: Queue = Queue()
        result_holder: dict = {}

        def on_token(token: str):
            event_queue.put({"type": "token", "content": token})

        def run_pipeline():
            graph_payload = {
                "question": question,
                "documents": [],
                "web_search_required": False,
                "generation": "",
            }
            collected_sources: list[str] = []
            set_stream_callback(on_token)
            try:
                event_queue.put({"type": "pipeline_start"})
                for event in crag_app.stream(graph_payload):
                    for node_name, state_update in event.items():
                        if node_name in PIPELINE_STEPS:
                            idx = PIPELINE_STEPS.index(node_name)
                            event_queue.put({
                                "type": "pipeline_step",
                                "step": node_name,
                                "index": idx,
                                "message": STATUS_MESSAGES.get(node_name, ""),
                            })
                        if node_name == "retrieve" and "documents" in state_update:
                            collected_sources.extend(state_update.get("documents", []))
                        graph_payload.update(state_update)
                result_holder["generation"] = graph_payload.get("generation", "")
                result_holder["sources"] = collected_sources
            except Exception as e:
                result_holder["error"] = str(e)
            finally:
                set_stream_callback(None)
                event_queue.put({"type": "_finished"})

        thread = threading.Thread(target=run_pipeline, daemon=True)
        thread.start()

        yield f"data: {json.dumps({'type': 'user_message_saved'})}\n\n"

        while True:
            try:
                item = event_queue.get(timeout=0.05)
            except Empty:
                if not thread.is_alive() and event_queue.empty():
                    break
                await asyncio.sleep(0.02)
                continue

            if item["type"] == "_finished":
                break
            yield f"data: {json.dumps(item)}\n\n"

        if "error" in result_holder:
            yield f"data: {json.dumps({'type': 'error', 'message': result_holder['error']})}\n\n"
            return

        generation = result_holder.get("generation", "")
        sources = result_holder.get("sources", [])

        assistant_msg = Message(
            chat_id=chat.id,
            role="assistant",
            content=generation or "I couldn't generate a response. Please try again.",
            sources=json.dumps(sources) if sources else None,
        )
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)

        yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id, 'sources': sources, 'content': generation})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
