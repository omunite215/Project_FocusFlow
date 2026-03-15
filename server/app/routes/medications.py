"""Medications API routes — /api/medications endpoint.

RAG-powered medication info via ChromaDB + Groq/LLaMA.
"""

from fastapi import APIRouter

from app.services import medication_service

router = APIRouter(prefix="/api/medications", tags=["medications"])


@router.get("")
async def get_medication_info(q: str = "") -> dict:
    """RAG-powered medication information and harm reduction data.

    Query about ADHD medications, timing, interactions, and study optimization.
    """
    query = q
    if not query.strip():
        return {
            "answer": (
                "Ask me about ADHD medications and how they relate to study performance. "
                "For example: 'When is the best time to study after taking Vyvanse?' or "
                "'How does caffeine interact with Adderall?'"
            ),
            "study_tips": [],
            "disclaimer": (
                "Always consult your prescribing physician for medical advice. "
                "FocusFlow provides educational information only."
            ),
            "sources_used": [],
        }

    return await medication_service.get_medication_info(query)
