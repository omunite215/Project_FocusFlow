"""RAG knowledge base ingestion — loads markdown documents into memory."""

from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"
COLLECTION_NAME = "focusflow_knowledge"

# Chunk configuration
CHUNK_SIZE = 500  # characters
CHUNK_OVERLAP = 100  # characters

# In-memory store: list of {"id", "text", "metadata"}
_chunks: list[dict] = []


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
        source = md_file.stem

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


def get_chunks() -> list[dict]:
    """Return the in-memory chunk store."""
    return _chunks


def ingest_knowledge_base(client=None) -> int:
    """Load all knowledge base documents into memory.

    The client parameter is accepted for backwards compatibility but ignored.
    Returns the number of documents ingested.
    """
    global _chunks
    _chunks = _load_documents()

    if not _chunks:
        print("No knowledge base documents found to ingest.")
        return 0

    sources = set(d["metadata"]["source"] for d in _chunks)
    print(f"Ingested {len(_chunks)} chunks from {len(sources)} documents (in-memory)")
    return len(_chunks)


if __name__ == "__main__":
    count = ingest_knowledge_base()
    print(f"Done. Total chunks: {count}")
