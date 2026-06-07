# Aura Intelligence — Full Stack CRAG SaaS

Production-grade AI SaaS frontend (Next.js) + authentication API (FastAPI) wrapping the existing CRAG pipeline.

## Architecture

```
frontend/     Next.js 16 + React + Framer Motion + Tailwind (port 3000)
backend/      FastAPI auth + chat SSE API (port 8000)
graph.py      LangGraph CRAG pipeline (unchanged)
nodes.py      RAG nodes (minimal streaming callback addition)
app.py        Legacy Streamlit UI (still works)
```

## Quick Start

### 1. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your API keys.

Generate a JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 3. Start the backend API

```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Start the frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Legacy Streamlit UI

```bash
streamlit run app.py
```

## Features

- **Landing page** — Hero, features, demo, pricing, FAQ, testimonials
- **Authentication** — Register, login, forgot/reset password, email verification, Google OAuth
- **Dashboard** — ChatGPT-style chat with sidebar, history, rename/delete
- **CRAG pipeline** — Full retrieve → grade → web search → generate flow preserved
- **Streaming** — Real-time SSE token streaming with pipeline progress
- **Settings** — Profile, password, theme, notifications

## Google OAuth Setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Set redirect URI: `http://localhost:8000/api/auth/google/callback`
3. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

## Email Verification

Without SMTP configured, verification/reset links are logged to the backend console.
