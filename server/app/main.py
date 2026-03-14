"""FocusFlow — FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # TODO: initialize ChromaDB, load RAG pipeline
    print("FocusFlow backend starting...")
    yield
    print("FocusFlow backend shutting down...")


app = FastAPI(
    title="FocusFlow API",
    description="AI-Powered Adaptive Study Session Manager for Neurodiverse Students",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — configured early per lessons.md rule [CORS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "focusflow"}


# TODO: include route routers
# from app.routes import profile, session, dashboard, medications
# app.include_router(profile.router, prefix="/api")
# app.include_router(session.router, prefix="/api")
# app.include_router(dashboard.router, prefix="/api")
# app.include_router(medications.router, prefix="/api")
