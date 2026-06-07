from typing import Callable, Optional
import streamlit as st
from state import GraphState

_stream_callback: Optional[Callable[[str], None]] = None


def set_stream_callback(callback: Optional[Callable[[str], None]]) -> None:
    global _stream_callback
    _stream_callback = callback
from config import grader_llm, generator_llm, tavily_client
from langchain_core.prompts import PromptTemplate
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# ==========================================
# GLOBAL INITIALIZATION (Runs once at startup)
# ==========================================
print("Loading embedding models into shared memory...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
print("Database index active!")

def retrieve(state: GraphState):
    print("\n--- [NODE] EXECUTING VECTOR SEARCH ---")
    question = state["question"]
    retrieved_docs = retriever.invoke(question)
    valid_documents = [doc.page_content for doc in retrieved_docs]
    return {"documents": valid_documents, "question": question}

def grade_documents(state: GraphState):
    print("\n--- [NODE] EVALUATING CONTEXT RELEVANCE ---")
    question = state["question"]
    documents = state["documents"]
    
    system_prompt = (
        "You are an objective grading algorithm. Your sole job is to check if a document contains facts to help answer the user's question.\n"
        "If the document is relevant, output exactly: YES\n"
        "If the document is completely unrelated, output exactly: NO\n"
        "Output ONLY the single word 'YES' or 'NO'. No punctuation, no commentary."
    )
    
    web_search_required = False
    valid_documents = []
    
    if not documents:
        return {"documents": [], "question": question, "web_search_required": True}
    
    for doc in documents:
        response = grader_llm.invoke([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"User Question: {question}\nDocument: {doc}"}
        ])
        
        cleaned_grade = "".join(char for char in response.content.strip().lower() if char.isalnum())
        
        if "yes" in cleaned_grade:
            print(" -> Context verified as RELEVANT")
            valid_documents.append(doc)
        else:
            print(" -> Context verified as IRRELEVANT")
            web_search_required = True
            
    return {
        "documents": valid_documents, 
        "question": question, 
        "web_search_required": web_search_required
    }

def route_after_grading(state: GraphState) -> str:
    if state["web_search_required"]:
        return "web_search_node"
    else:
        return "generate_node"

def web_search(state: GraphState):
    print("\n--- [NODE] EXECUTING LIVE WEB SEARCH ---")
    question = state["question"]
    documents = state.get("documents", [])
    
    try:
        search_results = tavily_client.search(query=question, max_results=2)
        web_context = "\n".join([result["content"] for result in search_results["results"]])
        documents.append(f"Live Web Context:\n{web_context}")
    except Exception as e:
        print(f"Search Gateway Warning: {e}")
        
    return {"documents": documents, "question": question}

def generate(state: GraphState):
    print("\n--- [NODE] STREAMING RESPONSE TO UI ---")
    question = state["question"]
    documents = state["documents"]
    context = "\n\n".join(documents)
    
    # Fully generalized enterprise-grade assistant template
    prompt = PromptTemplate(
        template="""You are an expert, highly advanced AI assistant. 
        Provide a comprehensive, accurate, and direct response to the user's request.
        
        Context Rules:
        1. If the question requests general knowledge, reasoning, logical puzzles, or code generation, use your full internal cognitive capabilities to provide an exceptional response.
        2. If the question relates specifically to internal company records or specific real-world data, reference the provided context below. If the context contains no helpful facts regarding that specific matter, state that the information is unavailable.
        
        Question: {question}
        Context: {context}
        
        Answer:""",
        input_variables=["question", "context"]
    )
    
    chain = prompt | generator_llm
    full_response = ""
    
    if _stream_callback is not None:
        for chunk in chain.stream({"context": context, "question": question}):
            full_response += chunk.content
            _stream_callback(chunk.content)
    elif hasattr(st, "session_state"):
        token_placeholder = st.empty()
        for chunk in chain.stream({"context": context, "question": question}):
            full_response += chunk.content
            token_placeholder.markdown(full_response)
    else:
        response = chain.invoke({"context": context, "question": question})
        full_response = response.content
        
    return {"generation": full_response, "question": question}