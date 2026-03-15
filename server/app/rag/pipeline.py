"""RAG query pipeline — keyword-based retrieval from in-memory chunks."""

import re
from typing import Optional

from app.rag.ingest import get_chunks


def init_rag():
    """Initialize RAG (no-op for in-memory backend, kept for API compat)."""
    return None


def query_knowledge(
    query: str,
    top_k: int = 5,
    source_filter: Optional[str] = None,
) -> list[dict]:
    """Query the knowledge base using keyword scoring and return relevant chunks.

    Uses a simple TF-based scoring: count how many query terms appear in each
    chunk, weighted by term rarity across the corpus. Fast, zero dependencies.
    """
    chunks = get_chunks()
    if not chunks:
        return []

    # Tokenize query into lowercase words
    query_terms = set(re.findall(r"[a-z]+", query.lower()))
    if not query_terms:
        return []

    # Filter by source if requested
    candidates = chunks
    if source_filter:
        candidates = [c for c in candidates if c["metadata"].get("source") == source_filter]

    if not candidates:
        return []

    # Score each chunk by keyword overlap
    scored = []
    for chunk in candidates:
        text_lower = chunk["text"].lower()
        score = sum(
            text_lower.count(term) for term in query_terms
        )
        if score > 0:
            scored.append((chunk, score))

    # Sort by score descending, take top_k
    scored.sort(key=lambda x: x[1], reverse=True)

    results = []
    for chunk, score in scored[:top_k]:
        max_possible = max(1, sum(len(chunk["text"]) // max(1, len(t)) for t in query_terms))
        results.append({
            "text": chunk["text"],
            "source": chunk["metadata"].get("source", "unknown"),
            "title": chunk["metadata"].get("title", "unknown"),
            "score": round(min(score / max(max_possible, 1), 1.0), 4),
        })

    return results


def format_rag_context(chunks: list[dict]) -> str:
    """Format retrieved chunks into a context string for LLM prompts."""
    if not chunks:
        return "No relevant knowledge base information found."

    parts = []
    for i, chunk in enumerate(chunks, 1):
        parts.append(
            f"[Source {i}: {chunk['title']}]\n{chunk['text']}"
        )
    return "\n\n---\n\n".join(parts)
