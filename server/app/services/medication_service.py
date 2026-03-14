"""Medication service — RAG-powered medication info and harm reduction."""

import logging
from typing import Optional

from app.prompts import medication_info as med_prompts
from app.rag.pipeline import format_rag_context, query_knowledge
from app.services import llm_service

logger = logging.getLogger(__name__)


async def get_medication_info(
    query: str,
    profile_context: Optional[str] = None,
) -> dict:
    """Answer a medication-related question using RAG + LLM.

    Args:
        query: The student's question about medications.
        profile_context: Optional profile context string for personalization.

    Returns:
        Dict with answer, study_tips, disclaimer, and sources_used.
    """
    # Query RAG — prioritize medication and harm reduction sources
    rag_chunks = query_knowledge(query, top_k=5, source_filter=None)
    rag_context = format_rag_context(rag_chunks)

    try:
        user_prompt = med_prompts.build_user_prompt(
            query=query,
            rag_context=rag_context,
            profile_context=profile_context,
        )

        result = await llm_service.generate_json(
            system_prompt=med_prompts.SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.3,
        )

        if "raw_response" not in result:
            # Ensure disclaimer is always present
            result.setdefault(
                "disclaimer",
                "Always consult your prescribing physician for medical advice. "
                "FocusFlow provides educational information only.",
            )
            return result

    except Exception as e:
        logger.warning(f"LLM medication query failed: {e}")

    # Fallback response
    return {
        "answer": (
            "I can provide educational information about ADHD medications and their "
            "relationship to study performance. Please try rephrasing your question, "
            "or ask about a specific medication like Vyvanse, Adderall, Ritalin, or Concerta."
        ),
        "study_tips": [],
        "disclaimer": (
            "Always consult your prescribing physician for medical advice. "
            "FocusFlow provides educational information only."
        ),
        "sources_used": [],
    }
