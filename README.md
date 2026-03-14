# FocusFlow

**AI-Powered Adaptive Study Session Manager for Neurodiverse Students**

Built for the 2026 ACM Northeastern Hackathon — Educational Health Track (Apulza)

## Quick Start

### Backend
```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your API keys
python -m app.rag.ingest  # Ingest RAG knowledge base
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd client
bun install
bun run dev
```

## Architecture

```
Client (React 19 + Vite + Tailwind)  →  REST API  →  Server (FastAPI + SQLAlchemy + ChromaDB + Groq/LLaMA 3.3)
```

## Team
- **Om Mandhane** — Backend, RAG Pipeline, AI/LLM
- **Vamsi** — Frontend, UI/UX, Charts & Dashboard
