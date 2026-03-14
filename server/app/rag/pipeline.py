"""RAG query pipeline — retrieve relevant knowledge chunks from ChromaDB."""

from typing import Optional

import chromadb

from app.rag.ingest import COLLECTION_NAME, get_chroma_client

# Module-level client (initialized on first use or via init_rag)
_client: Optional[chromadb.ClientAPI] = None


def init_rag() -> chromadb.ClientAPI:
    """Initialize the ChromaDB client and return it. Called at app startup."""
    global _client
    _client = get_chroma_client()
    return _client


def get_client() -> chromadb.ClientAPI:
    """Get the ChromaDB client, initializing if needed."""
    global _client
    if _client is None:
        _client = init_rag()
    return _client


def query_knowledge(
    query: str,
    top_k: int = 5,
    source_filter: Optional[str] = None,
) -> list[dict]:
    """Query the knowledge base and return relevant chunks with metadata.

    Args:
        query: The user's question or context string.
        top_k: Number of top results to return.
        source_filter: Optional filter to restrict to a specific source document
                       (e.g., "medication_reference", "study_strategies").

    Returns:
        List of dicts with keys: text, source, title, score.
    """
    client = get_client()

    try:
        collection = client.get_collection(COLLECTION_NAME)
    except Exception:
        # Collection doesn't exist yet — return empty
        return []

    where_filter = None
    if source_filter:
        where_filter = {"source": source_filter}

    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        where=where_filter,
        include=["documents", "metadatas", "distances"],
    )

    if not results["documents"] or not results["documents"][0]:
        return []

    chunks = []
    for doc, meta, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        chunks.append({
            "text": doc,
            "source": meta.get("source", "unknown"),
            "title": meta.get("title", "unknown"),
            "score": round(1 - distance, 4),  # Convert distance to similarity
        })

    return chunks


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
