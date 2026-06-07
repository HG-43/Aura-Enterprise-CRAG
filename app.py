import streamlit as st
from graph import app as crag_app

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Aura Intelligence",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Global theme ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
    --bg-base:       #050507;
    --bg-surface:    #0c0c0f;
    --bg-elevated:   #141418;
    --bg-hover:      #1c1c22;
    --bg-glass:      rgba(20,20,24,0.72);
    --border:        rgba(255,255,255,0.06);
    --border-strong: rgba(255,255,255,0.11);
    --text-primary:  #f4f4f5;
    --text-secondary:#a1a1aa;
    --text-muted:    #63636e;
    --accent:        #a78bfa;
    --accent-2:      #6366f1;
    --accent-soft:   rgba(167,139,250,0.12);
    --accent-glow:   rgba(139,92,246,0.45);
    --gradient:      linear-gradient(135deg, #c084fc 0%, #818cf8 45%, #60a5fa 100%);
    --user-bg:       rgba(99,102,241,0.08);
    --user-border:   rgba(99,102,241,0.22);
}

/* ── Ambient background ── */
.stApp {
    background-color: var(--bg-base);
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.stApp::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
        radial-gradient(ellipse 80% 50% at 15% -10%, rgba(139,92,246,0.18) 0%, transparent 55%),
        radial-gradient(ellipse 60% 40% at 85% 5%,  rgba(59,130,246,0.12) 0%, transparent 50%),
        radial-gradient(ellipse 50% 30% at 50% 100%, rgba(99,102,241,0.08) 0%, transparent 45%);
}
.stApp > header { background: transparent; }
header { visibility: hidden; }
#MainMenu, footer { visibility: hidden; }

.block-container {
    position: relative; z-index: 1;
    padding-top: 0.5rem;
    padding-bottom: 7rem;
    max-width: 780px;
}

/* ── Sidebar ── */
[data-testid="stSidebar"] {
    background: rgba(8,8,10,0.92);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--border);
}
[data-testid="stSidebar"] > div:first-child { padding-top: 1rem; }

.sidebar-brand {
    display: flex; align-items: center; gap: 0.7rem;
    padding: 0.5rem 0.6rem 1.25rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 0.85rem;
}
.sidebar-brand-icon {
    width: 36px; height: 36px; border-radius: 11px;
    background: var(--gradient);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; color: #fff;
    box-shadow: 0 0 28px var(--accent-glow);
    animation: iconPulse 4s ease-in-out infinite;
}
.sidebar-brand-text {
    font-size: 0.975rem; font-weight: 700;
    letter-spacing: -0.025em; color: var(--text-primary);
}
.sidebar-brand-sub {
    font-size: 0.65rem; color: var(--text-muted);
    letter-spacing: 0.06em; text-transform: uppercase; margin-top: 1px;
}

[data-testid="stSidebar"] .stButton:first-of-type > button {
    background: var(--gradient) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 11px !important;
    padding: 0.6rem 1rem !important;
    font-size: 0.875rem !important;
    font-weight: 600 !important;
    font-family: 'Inter', sans-serif !important;
    box-shadow: 0 4px 20px rgba(139,92,246,0.3) !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
    margin-bottom: 0.25rem !important;
}
[data-testid="stSidebar"] .stButton:first-of-type > button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 28px rgba(139,92,246,0.45) !important;
}

[data-testid="stSidebar"] .stButton:not(:first-of-type) > button {
    background: transparent !important;
    color: var(--text-secondary) !important;
    border: 1px solid transparent !important;
    border-radius: 9px !important;
    text-align: left !important;
    justify-content: flex-start !important;
    padding: 0.55rem 0.8rem !important;
    font-size: 0.8125rem !important;
    font-family: 'Inter', sans-serif !important;
    transition: all 0.15s ease !important;
}
[data-testid="stSidebar"] .stButton:not(:first-of-type) > button:hover {
    background: var(--bg-hover) !important;
    color: var(--text-primary) !important;
    border-color: var(--border) !important;
}

.sidebar-section-label {
    font-size: 0.65rem; color: var(--text-muted);
    font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.1em; padding: 0.85rem 0.8rem 0.35rem;
}

.sidebar-capabilities {
    margin-top: 2rem;
    padding: 0.8rem;
    border-top: 1px solid var(--border);
}
.sidebar-cap-label {
    font-size: 0.65rem; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 0.5rem;
}
.sidebar-pills { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.sidebar-pill {
    font-size: 0.68rem; padding: 0.2rem 0.55rem;
    border-radius: 999px;
    background: var(--accent-soft);
    border: 1px solid rgba(167,139,250,0.2);
    color: var(--accent);
}

/* ── Chat header ── */
.chat-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 0 1.25rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
    animation: fadeUp 0.4s ease both;
}
.chat-header-left { display: flex; align-items: center; gap: 0.6rem; }
.chat-header-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34,197,94,0.6);
}
.chat-header-title {
    font-size: 0.875rem; font-weight: 600;
    color: var(--text-primary); letter-spacing: -0.01em;
}
.chat-header-badge {
    font-size: 0.7rem; font-weight: 500;
    padding: 0.25rem 0.65rem; border-radius: 999px;
    background: var(--accent-soft);
    border: 1px solid rgba(167,139,250,0.25);
    color: var(--accent);
}

/* ── Chat input ── */
.stChatInputContainer {
    padding-bottom: 1.5rem;
    background: linear-gradient(to top, var(--bg-base) 70%, transparent);
}
.stChatInputContainer > div {
    background: var(--bg-glass) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid var(--border-strong) !important;
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04) !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease !important;
}
.stChatInputContainer > div:focus-within {
    border-color: rgba(167,139,250,0.55) !important;
    box-shadow: 0 0 0 4px var(--accent-soft), 0 8px 32px rgba(0,0,0,0.5) !important;
}
.stChatInputContainer textarea {
    color: var(--text-primary) !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.9375rem !important;
}
.stChatInputContainer textarea::placeholder { color: var(--text-muted) !important; }

/* ── Chat messages ── */
[data-testid="stChatMessage"] {
    background: transparent !important;
    padding: 0.85rem 0 !important;
    border-bottom: none !important;
    animation: msgIn 0.35s ease both;
}
[data-testid="stChatMessage"] [data-testid="stMarkdownContainer"] p {
    font-size: 0.9375rem; line-height: 1.75; color: var(--text-primary);
}
[data-testid="stChatMessage"] [data-testid="stMarkdownContainer"] code {
    background: rgba(255,255,255,0.06) !important;
    border-radius: 5px; padding: 0.1em 0.35em;
    font-size: 0.85em;
}

/* User bubble */
div[data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-user"]) {
    background: var(--user-bg) !important;
    border: 1px solid var(--user-border) !important;
    border-radius: 14px !important;
    padding: 0.85rem 1.1rem !important;
    margin: 0.35rem 0 0.75rem 2.5rem !important;
}

/* Assistant bubble */
div[data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-assistant"]) {
    background: var(--bg-elevated) !important;
    border: 1px solid var(--border) !important;
    border-radius: 14px !important;
    padding: 0.85rem 1.1rem !important;
    margin: 0.35rem 2.5rem 0.75rem 0 !important;
}

/* ── Landing ── */
.landing-wrap {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 52vh;
    text-align: center; padding: 1.5rem 1rem 1rem;
    animation: fadeUp 0.55s ease both;
}
.landing-orb {
    position: relative; width: 72px; height: 72px; margin-bottom: 1.75rem;
}
.landing-orb-core {
    width: 72px; height: 72px; border-radius: 22px;
    background: var(--gradient);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.75rem; color: #fff; position: relative; z-index: 1;
    box-shadow: 0 0 50px var(--accent-glow);
}
.landing-orb-ring {
    position: absolute; inset: -8px; border-radius: 28px;
    border: 1px solid rgba(167,139,250,0.3);
    animation: ringSpin 8s linear infinite;
}
.landing-title {
    font-size: 2.25rem; font-weight: 700; letter-spacing: -0.04em;
    background: var(--gradient);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; margin: 0 0 0.5rem;
}
.landing-subtitle {
    font-size: 1rem; color: var(--text-secondary);
    font-weight: 400; margin: 0 0 0.35rem;
}
.landing-hint {
    font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 2rem;
}

/* Suggestion cards */
.suggest-label {
    font-size: 0.7rem; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.08em;
    text-align: center; margin-bottom: 0.75rem;
}
div[data-testid="column"] .stButton > button {
    background: var(--bg-elevated) !important;
    border: 1px solid var(--border-strong) !important;
    border-radius: 13px !important;
    color: var(--text-secondary) !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.8125rem !important;
    font-weight: 500 !important;
    padding: 0.85rem 0.75rem !important;
    text-align: left !important;
    height: auto !important;
    min-height: 72px !important;
    line-height: 1.45 !important;
    transition: all 0.18s ease !important;
    white-space: normal !important;
}
div[data-testid="column"] .stButton > button:hover {
    background: var(--bg-hover) !important;
    border-color: rgba(167,139,250,0.4) !important;
    color: var(--text-primary) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(167,139,250,0.15) !important;
}

/* ── Pipeline progress ── */
.pipeline-wrap { margin-bottom: 0.75rem; animation: fadeUp 0.3s ease both; }
.pipeline-steps {
    display: flex; gap: 0.35rem; margin-bottom: 0.6rem;
}
.pipeline-step {
    flex: 1; height: 3px; border-radius: 99px;
    background: var(--border-strong);
    transition: background 0.3s ease;
}
.pipeline-step.active { background: var(--gradient); box-shadow: 0 0 8px var(--accent-glow); }
.pipeline-step.done   { background: rgba(167,139,250,0.5); }

.status-pill {
    display: inline-flex; align-items: center; gap: 0.55rem;
    background: var(--bg-glass); backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    border-radius: 999px; padding: 0.4rem 0.9rem;
    font-size: 0.8125rem; color: var(--text-secondary);
}
.status-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent);
    animation: pulse 1.2s ease infinite;
}

/* Typing indicator */
.typing-dots { display: inline-flex; gap: 4px; align-items: center; padding: 0.5rem 0; }
.typing-dots span {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--accent); opacity: 0.4;
    animation: typingBounce 1.2s ease infinite;
}
.typing-dots span:nth-child(2) { animation-delay: 0.15s; }
.typing-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(0.8); }
}
@keyframes iconPulse {
    0%, 100% { box-shadow: 0 0 28px var(--accent-glow); }
    50%       { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
}
@keyframes ringSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}
@keyframes typingBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%            { transform: translateY(-6px); opacity: 1; }
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }
</style>
""", unsafe_allow_html=True)

# ── Constants ────────────────────────────────────────────────────────────────
USER_ICON = "👤"
AI_ICON = "✨"

SUGGESTIONS = [
    ("🔍  Research", "What are the key differences between RAG and fine-tuning?"),
    ("📄  Analyze", "Summarize the main concepts from my knowledge base."),
    ("🌐  Web search", "What happened in AI research this week?"),
    ("💡  Explain", "Explain corrective RAG in simple terms."),
]

PIPELINE_STEPS = [
    ("retrieve", "Retrieve"),
    ("grade_documents", "Grade"),
    ("web_search_node", "Web"),
    ("generate_node", "Generate"),
]

STATUS_MESSAGES = {
    "retrieve": "Searching internal knowledge base",
    "grade_documents": "Evaluating document relevance",
    "web_search_node": "Fetching live web intelligence",
    "generate_node": "Generating response",
}

# ── Session state ────────────────────────────────────────────────────────────
if "all_chats" not in st.session_state:
    st.session_state.all_chats = {"session_1": []}
if "active_chat_id" not in st.session_state:
    st.session_state.active_chat_id = "session_1"

# ── Sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
        <div class="sidebar-brand">
            <div class="sidebar-brand-icon">✨</div>
            <div>
                <div class="sidebar-brand-text">Aura Intelligence</div>
                <div class="sidebar-brand-sub">Adaptive RAG Engine</div>
            </div>
        </div>
    """, unsafe_allow_html=True)

    if st.button("＋  New conversation", use_container_width=True):
        new_session_id = f"session_{len(st.session_state.all_chats) + 1}"
        st.session_state.all_chats[new_session_id] = []
        st.session_state.active_chat_id = new_session_id
        st.rerun()

    st.markdown('<p class="sidebar-section-label">Recent</p>', unsafe_allow_html=True)

    for chat_id, messages in reversed(st.session_state.all_chats.items()):
        is_active = chat_id == st.session_state.active_chat_id
        prefix = "▸ " if is_active else ""
        sidebar_title = messages[0]["content"][:26] + "…" if messages else "New conversation"
        if st.button(f"{prefix}{sidebar_title}", key=f"nav_{chat_id}", use_container_width=True):
            st.session_state.active_chat_id = chat_id
            st.rerun()

    st.markdown("""
        <div class="sidebar-capabilities">
            <div class="sidebar-cap-label">Powered by</div>
            <div class="sidebar-pills">
                <span class="sidebar-pill">RAG</span>
                <span class="sidebar-pill">Web Search</span>
                <span class="sidebar-pill">GPT-4o</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

# ── Main chat area ───────────────────────────────────────────────────────────
active_messages = st.session_state.all_chats[st.session_state.active_chat_id]

# Landing screen
if not active_messages:
    st.markdown("""
        <div class="landing-wrap">
            <div class="landing-orb">
                <div class="landing-orb-ring"></div>
                <div class="landing-orb-core">✨</div>
            </div>
            <h1 class="landing-title">Aura Intelligence</h1>
            <p class="landing-subtitle">How can I help you today?</p>
            <p class="landing-hint">Pick a starter below or type your own question</p>
        </div>
        <p class="suggest-label">Try asking</p>
    """, unsafe_allow_html=True)

    col_a, col_b = st.columns(2)
    for i, (label, prompt_text) in enumerate(SUGGESTIONS):
        col = col_a if i % 2 == 0 else col_b
        with col:
            if st.button(label, key=f"suggest_{i}", use_container_width=True):
                active_messages.append({"role": "user", "content": prompt_text})
                st.rerun()

else:
    conv_title = active_messages[0]["content"][:42] + ("…" if len(active_messages[0]["content"]) > 42 else "")
    st.markdown(f"""
        <div class="chat-header">
            <div class="chat-header-left">
                <span class="chat-header-dot"></span>
                <span class="chat-header-title">{conv_title}</span>
            </div>
            <span class="chat-header-badge">Aura Intelligence</span>
        </div>
    """, unsafe_allow_html=True)

for message in active_messages:
    icon = USER_ICON if message["role"] == "user" else AI_ICON
    with st.chat_message(message["role"], avatar=icon):
        st.markdown(message["content"])

if prompt := st.chat_input("Message Aura Intelligence…"):
    active_messages.append({"role": "user", "content": prompt})
    st.rerun()

if active_messages and active_messages[-1]["role"] == "user":
    last_user_query = active_messages[-1]["content"]

    with st.chat_message("assistant", avatar=AI_ICON):
        status_notification = st.empty()
        progress_notification = st.empty()

        graph_payload = {
            "question": last_user_query,
            "documents": [],
            "web_search_required": False,
            "generation": "",
        }

        step_keys = [s[0] for s in PIPELINE_STEPS]
        current_step_idx = -1

        def render_pipeline(active_idx: int, status_msg: str | None = None):
            steps_html = ""
            for i, (_, label) in enumerate(PIPELINE_STEPS):
                cls = "pipeline-step"
                if i < active_idx:
                    cls += " done"
                elif i == active_idx:
                    cls += " active"
                steps_html += f'<div class="{cls}" title="{label}"></div>'

            status_html = ""
            if status_msg:
                status_html = f'<div class="status-pill"><span class="status-dot"></span>{status_msg}</div>'
            elif active_idx < 0:
                status_html = '<div class="typing-dots"><span></span><span></span><span></span></div>'

            progress_notification.markdown(
                f'<div class="pipeline-wrap"><div class="pipeline-steps">{steps_html}</div>{status_html}</div>',
                unsafe_allow_html=True,
            )

        render_pipeline(-1)

        for event in crag_app.stream(graph_payload):
            for node_name, state_update in event.items():
                if node_name in step_keys:
                    current_step_idx = step_keys.index(node_name)
                    msg = STATUS_MESSAGES.get(node_name)
                    if node_name == "generate_node":
                        render_pipeline(current_step_idx, msg)
                        status_notification.markdown(
                            '<div class="typing-dots"><span></span><span></span><span></span></div>',
                            unsafe_allow_html=True,
                        )
                    else:
                        render_pipeline(current_step_idx, msg)

                graph_payload.update(state_update)

        progress_notification.empty()
        status_notification.empty()

        if "generation" in graph_payload and graph_payload["generation"]:
            active_messages.append({"role": "assistant", "content": graph_payload["generation"]})
            st.rerun()
        else:
            st.error("Aura Intelligence couldn't resolve this request. Please try again.")
