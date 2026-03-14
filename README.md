# FocusFlow

**AI-Powered Adaptive Study Session Manager for Neurodiverse Students**

Built for the 2026 ACM Northeastern Hackathon — Educational Health Track (Apulza)

---

## What is FocusFlow?

FocusFlow applies the physical-health performance tracking paradigm to cognitive performance. It detects focus in real-time, tracks degradation over study blocks, and intervenes before burnout — all powered by a RAG-enhanced LLM grounded in ADHD research.

## Tech Stack

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

## Getting Started

### Prerequisites

- Node.js 22 LTS
- Bun (latest)
- Python 3.12+

### Frontend

```bash
cd client
bun install
bun run dev
```

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env      # fill in your GROQ_API_KEY
uvicorn app.main:app --reload
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

- `GROQ_API_KEY` — Get from [Groq Console](https://console.groq.com)
- `VITE_API_URL` — Backend URL (default: `http://localhost:8000`)

## Team

- **Om Mandhane** — Backend, RAG Pipeline, AI/LLM
- **Vamsi** — Frontend, UI/UX, Charts

## License

Built for the 2026 ACM Northeastern Hackathon.
