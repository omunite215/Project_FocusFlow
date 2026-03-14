# FocusFlow — Task Tracker

**Last Updated**: March 14, 2026
**Status**: 🟡 In Progress

---

## Phase 1: Project Setup (Hours 1–3)

### Om — Backend Setup
- [ ] Initialize FastAPI project structure (`/server`)
- [ ] Set up SQLAlchemy 2.0 + SQLite connection
- [ ] Create database models: UserProfile, StudySession, FocusCheckIn
- [ ] Create Pydantic v2 schemas for all endpoints
- [ ] Implement POST `/api/profile` and GET `/api/profile/{id}`
- [ ] Configure CORS middleware for localhost:5173
- [ ] Create `.env.example` with all required variables
- [ ] Test endpoints with httpie/curl

### Vamsi — Frontend Setup
- [ ] Initialize Vite + React 19 project with Bun (`/client`)
- [ ] Install & configure Tailwind CSS 4
- [ ] Install GSAP, Animate UI, Recharts, Zustand, React Router, Axios
- [ ] Set up project structure (components, hooks, services, stores, pages)
- [ ] Configure Axios instance with base URL
- [ ] Create routing with React Router 7
- [ ] Build Onboarding/Profile setup page
- [ ] Implement base UI components (Button, Card, Input, Slider)

---

## Phase 2: RAG Pipeline + Session UI (Hours 3–6)

### Om — RAG Pipeline
- [ ] Install ChromaDB + Sentence-Transformers
- [ ] Write knowledge base documents (ADHD, study strategies, medications, harm reduction)
- [ ] Build ingestion script (`rag/ingest.py`)
- [ ] Build RAG query pipeline (`rag/pipeline.py`)
- [ ] Test retrieval quality with sample queries
- [ ] Set up Groq API client

### Vamsi — Session UI
- [ ] Build SessionTimer component with countdown/countup
- [ ] Build FocusCheckIn component (1–5 quick-tap scale)
- [ ] Build FocusCurve component (Recharts real-time line chart)
- [ ] Build SessionPlan display component
- [ ] Create session Zustand store
- [ ] Implement useTimer hook with pause/resume

---

## Phase 3: Core AI Features + Dashboard (Hours 6–10)

### Om — Session API + LLM Integration
- [ ] Implement POST `/api/session/start` with LLM session plan generation
- [ ] Write session planner prompt template
- [ ] Implement POST `/api/session/checkin` with adaptation logic
- [ ] Write adaptation prompt template
- [ ] Implement POST `/api/session/end` with report trigger
- [ ] Test full session lifecycle via API

### Vamsi — Dashboard + API Integration
- [ ] Build Dashboard page layout
- [ ] Implement FocusTrends chart (multi-session line chart)
- [ ] Implement StudyHeatmap (optimal times)
- [ ] Connect Onboarding page to POST `/api/profile`
- [ ] Connect Session flow to backend APIs
- [ ] Wire up real-time focus curve to check-in data

---

## Phase 4: Reports + Medication + Polish (Hours 10–14)

### Om — AI Reports + Medication Module
- [ ] Implement AI report generation endpoint
- [ ] Write report generation prompt template
- [ ] Implement GET `/api/medications` with RAG
- [ ] Write medication info prompt template
- [ ] Refine all prompts based on output quality
- [ ] Tune RAG retrieval (chunk size, top-k, overlap)

### Vamsi — Report UI + Medication Page + Polish
- [ ] Build SessionReport display component
- [ ] Build Medications info page
- [ ] Build Profile edit/management page
- [ ] Full API integration for all endpoints
- [ ] GSAP animations for page transitions
- [ ] Animate UI micro-interactions (check-in, timer, notifications)

---

## Phase 5: Deployment + Testing (Hours 14–18)

### Om — Backend Deployment
- [ ] Create Dockerfile for Render
- [ ] Deploy backend to Render
- [ ] Configure production environment variables
- [ ] Test all endpoints against deployed backend
- [ ] Handle Render cold start gracefully (loading states)

### Vamsi — Frontend Deployment
- [ ] Configure Vercel project
- [ ] Set `VITE_API_URL` environment variable
- [ ] Deploy frontend to Vercel
- [ ] Test full flow on deployed app
- [ ] Responsive design check (mobile, tablet, desktop)
- [ ] Accessibility pass (keyboard nav, screen reader, color contrast)

---

## Phase 6: Final Polish + Submission (Hours 18–22)

### Om
- [ ] End-to-end bug fixes
- [ ] Write comprehensive README with setup instructions
- [ ] Architecture diagram for README
- [ ] GitHub repo cleanup (remove debug code, organize)
- [ ] `.env.example` files finalized

### Vamsi
- [ ] Record 3–5 minute demo video
- [ ] Write project description for submission
- [ ] Final UI polish pass
- [ ] Screenshot collection for README
- [ ] Submit to hackathon

---

## Review Notes

_Add review notes here as phases complete._

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 | ⬜ | — |
| Phase 2 | ⬜ | — |
| Phase 3 | ⬜ | — |
| Phase 4 | ⬜ | — |
| Phase 5 | ⬜ | — |
| Phase 6 | ⬜ | — |
