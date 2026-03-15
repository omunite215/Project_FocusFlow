"""FocusFlow FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.rag.ingest import ingest_knowledge_base
from app.rag.pipeline import init_rag
from app.routes import dashboard, medications, profile, session


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: create database tables
    await init_db()
    print("[OK] Database initialized")

    # Startup: load knowledge base into memory
    init_rag()
    ingest_knowledge_base()
    print("[OK] RAG knowledge base loaded")

    yield
    # Shutdown: cleanup if needed
    print("[INFO] Shutting down FocusFlow")


app = FastAPI(
    title="FocusFlow API",
    description="AI-Powered Adaptive Study Session Manager for Neurodiverse Students",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — configured early per lessons rule [CORS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(profile.router)
app.include_router(session.router)
app.include_router(dashboard.router)
app.include_router(medications.router)


@app.get("/api/health")
async def health_check() -> dict:
    """Health check endpoint for Render and monitoring."""
    return {"status": "healthy", "service": "focusflow-api"}
