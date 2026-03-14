"""Groq LLM client service — handles all LLaMA 3.3 70B inference calls."""

import json

from groq import AsyncGroq

from app.config import settings

_client: AsyncGroq | None = None

MODEL = "llama-3.3-70b-versatile"


def _get_client() -> AsyncGroq:
    """Get or create the async Groq client."""
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.groq_api_key)
    return _client


async def generate(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
    max_tokens: int = 2048,
) -> str:
    """Call Groq LLaMA 3.3 and return the text response.

    Args:
        system_prompt: System message setting AI behavior.
        user_prompt: The user's request with context.
        temperature: Creativity control (0.3 for plans, 0.5 for reports, 0.7 for advice).
        max_tokens: Maximum response length.

    Returns:
        The assistant's text response.
    """
    client = _get_client()

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content or ""


async def generate_json(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
    max_tokens: int = 2048,
) -> dict:
    """Call Groq LLaMA 3.3 and parse the response as JSON.

    Falls back to wrapping raw text if JSON parsing fails.
    """
    raw = await generate(system_prompt, user_prompt, temperature, max_tokens)

    # Try to extract JSON from the response
    # LLMs sometimes wrap JSON in markdown code blocks
    cleaned = raw.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # If JSON parsing fails, return a wrapper with raw text
        return {"raw_response": raw}
