"""RAG knowledge base ingestion — loads markdown documents into ChromaDB."""

import os
from pathlib import Path

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import settings

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"
COLLECTION_NAME = "focusflow_knowledge"

# Chunk configuration
CHUNK_SIZE = 500  # characters
CHUNK_OVERLAP = 100  # characters


def _chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks by character count, respecting paragraph boundaries."""
    paragraphs = text.split("\n\n")
    chunks: list[str] = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) + 2 <= chunk_size:
            current_chunk = f"{current_chunk}\n\n{para}" if current_chunk else para
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            # If a single paragraph exceeds chunk_size, split it by sentences
            if len(para) > chunk_size:
                sentences = para.replace(". ", ".\n").split("\n")
                current_chunk = ""
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) + 1 <= chunk_size:
                        current_chunk = f"{current_chunk} {sentence}" if current_chunk else sentence
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence
            else:
                current_chunk = para

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks


def _load_documents() -> list[dict]:
    """Load all markdown files from the knowledge directory and chunk them."""
    documents: list[dict] = []

    for md_file in sorted(KNOWLEDGE_DIR.glob("*.md")):
        if md_file.name == "README.md":
            continue

        content = md_file.read_text(encoding="utf-8")
        source = md_file.stem  # e.g., "adhd_cognitive_science"

        # Extract title from first line if it's a heading
        lines = content.split("\n")
        title = lines[0].lstrip("# ").strip() if lines and lines[0].startswith("#") else source

        chunks = _chunk_text(content)
        for i, chunk in enumerate(chunks):
            documents.append({
                "id": f"{source}_chunk_{i}",
                "text": chunk,
                "metadata": {
                    "source": source,
                    "title": title,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                },
            })

    return documents


def get_chroma_client() -> chromadb.ClientAPI:
    """Create a ChromaDB persistent client."""
    persist_dir = settings.chroma_persist_dir
    os.makedirs(persist_dir, exist_ok=True)
    return chromadb.PersistentClient(
        path=persist_dir,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def ingest_knowledge_base(client: chromadb.ClientAPI | None = None) -> int:
    """Ingest all knowledge base documents into ChromaDB.

    Returns the number of documents ingested.
    """
    if client is None:
        client = get_chroma_client()

    # Delete existing collection to re-ingest fresh
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass  # Collection doesn't exist yet

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    documents = _load_documents()
    if not documents:
        print("No knowledge base documents found to ingest.")
        return 0

    # Batch add to ChromaDB (it handles embedding via default model)
    collection.add(
        ids=[d["id"] for d in documents],
        documents=[d["text"] for d in documents],
        metadatas=[d["metadata"] for d in documents],
    )

    print(f"Ingested {len(documents)} chunks from {len(set(d['metadata']['source'] for d in documents))} documents")
    return len(documents)


if __name__ == "__main__":
    count = ingest_knowledge_base()
    print(f"Done. Total chunks: {count}")
