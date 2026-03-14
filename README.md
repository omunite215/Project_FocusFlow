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

### Environment Variables

Copy `.env.example` to `.env` and fill in:

- `GROQ_API_KEY` — Get from [Groq Console](https://console.groq.com)
- `VITE_API_URL` — Backend URL (default: `http://localhost:8000`)

## Architecture

```
Client (React 19 + Vite + Tailwind)  →  REST API  →  Server (FastAPI + SQLAlchemy + ChromaDB + Groq/LLaMA 3.3)
```

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 6 + Tailwind CSS 4 |
| Animation | GSAP + Animate UI |
| Charts | Recharts |
| State | Zustand |
| Backend | FastAPI + SQLAlchemy 2.0 + SQLite |
| AI/LLM | LLaMA 3.3 70B via Groq |
| RAG | ChromaDB + Sentence-Transformers |
| Deployment | Vercel (frontend) + Render (backend) |

## Team
- **Om Mandhane** — Backend, RAG Pipeline, AI/LLM
- **Vamsi** — Frontend, UI/UX, Charts & Dashboard
