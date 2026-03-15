"""Session API routes — /api/session endpoints."""

import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.session import StudySession
from app.schemas.session import (
    CheckInRequest,
    CheckInResponse,
    SessionEndRequest,
    SessionEndResponse,
    SessionStartRequest,
    SessionStartResponse,
)
from app.services import session_service, llm_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/session", tags=["session"])


@router.post("/start", response_model=SessionStartResponse)
async def start_session(
    data: SessionStartRequest, db: AsyncSession = Depends(get_db)
) -> SessionStartResponse:
    """Initialize a new study session and return an AI-generated plan."""
    return await session_service.start_session(db, data)


@router.post("/checkin", response_model=CheckInResponse)
async def record_checkin(
    data: CheckInRequest, db: AsyncSession = Depends(get_db)
) -> CheckInResponse:
    """Log a focus micro check-in (1-5 scale) and get adaptation if needed."""
    return await session_service.record_checkin(db, data)


@router.post("/end", response_model=SessionEndResponse)
async def end_session(
    data: SessionEndRequest, db: AsyncSession = Depends(get_db)
) -> SessionEndResponse:
    """End a study session and generate an AI coaching report."""
    try:
        return await session_service.end_session(db, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/report/{session_id}")
async def get_report(
    session_id: str, db: AsyncSession = Depends(get_db)
):
    """Retrieve the report for a completed session."""
    result = await db.execute(
        select(StudySession).where(StudySession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.ai_report:
        raise HTTPException(status_code=404, detail="Report not generated yet")
    return {"session_id": session_id, "report": json.loads(session.ai_report)}


# --- Task 2: Magic Micro-Task Breakdown ---

class BreakdownRequest(BaseModel):
    task: str = Field(..., min_length=3, max_length=500)


class MicroStep(BaseModel):
    step: int
    action: str
    time_estimate: str


class BreakdownResponse(BaseModel):
    original_task: str
    micro_steps: list[MicroStep]


BREAKDOWN_SYSTEM_PROMPT = """You are FocusFlow's Micro-Task Coach for students with ADHD/executive dysfunction.

When a student feels overwhelmed by a task, you break it into 3-5 ridiculously small, frictionless micro-steps that bypass the executive function barrier.

RULES:
- Each step must be so small it feels almost silly — the point is to eliminate the "starting" friction.
- Use concrete, physical actions ("Open the textbook to page X" not "Review chapter 3").
- First step should take under 30 seconds. This is critical for ADHD brains.
- No guilt, no pressure. Frame steps as tiny wins.
- Include a rough time estimate per step.

OUTPUT FORMAT — respond with valid JSON only, no other text:
{
  "micro_steps": [
    {"step": 1, "action": "description", "time_estimate": "30 seconds"},
    {"step": 2, "action": "description", "time_estimate": "2 minutes"}
  ]
}"""


@router.post("/breakdown", response_model=BreakdownResponse)
async def breakdown_task(data: BreakdownRequest):
    """Break a large task into 3-5 frictionless micro-steps using AI."""
    try:
        result = await llm_service.generate_json(
            system_prompt=BREAKDOWN_SYSTEM_PROMPT,
            user_prompt=f"Break down this task into micro-steps: {data.task}",
            temperature=0.5,
        )

        steps = result.get("micro_steps", [])
        if steps:
            return BreakdownResponse(
                original_task=data.task,
                micro_steps=[MicroStep(**s) for s in steps[:5]],
            )
    except Exception as e:
        logger.warning(f"LLM breakdown failed, using stub: {e}")

    # Fallback stub
    return BreakdownResponse(
        original_task=data.task,
        micro_steps=[
            MicroStep(step=1, action=f"Open your materials for: {data.task}", time_estimate="30 seconds"),
            MicroStep(step=2, action="Read just the first paragraph or problem statement", time_estimate="2 minutes"),
            MicroStep(step=3, action="Write down one thing you already know about it", time_estimate="1 minute"),
            MicroStep(step=4, action="Attempt the very first small part", time_estimate="5 minutes"),
            MicroStep(step=5, action="Take a breath. You've started — that's the hardest part", time_estimate="30 seconds"),
        ],
    )


# --- Task 4: Chrome Extension Session Status API ---

class SessionStatusResponse(BaseModel):
    is_active: bool
    remaining_minutes: int = 0
    current_subject: str | None = None
    session_id: str | None = None


@router.get("/status/{user_id}", response_model=SessionStatusResponse)
async def get_session_status(
    user_id: str, db: AsyncSession = Depends(get_db)
):
    """Check if a user is currently in an active focus session.
    Designed for Chrome extension polling.
    """
    result = await db.execute(
        select(StudySession)
        .where(
            StudySession.user_id == user_id,
            StudySession.status == "active",
        )
        .order_by(StudySession.started_at.desc())
        .limit(1)
    )
    session = result.scalar_one_or_none()

    if session is None:
        return SessionStatusResponse(is_active=False)

    # Calculate remaining time
    remaining = 0
    current_subject = None

    if session.started_at and session.planned_duration_min:
        started = session.started_at.replace(tzinfo=timezone.utc) if session.started_at.tzinfo is None else session.started_at
        elapsed_min = (datetime.now(timezone.utc) - started).total_seconds() / 60
        remaining = max(0, int(session.planned_duration_min - elapsed_min))

    # Extract current subject from plan
    if session.session_plan:
        try:
            plan = json.loads(session.session_plan)
            blocks = plan.get("blocks", [])
            if blocks:
                current_subject = blocks[0].get("subject")
        except (json.JSONDecodeError, TypeError):
            pass

    return SessionStatusResponse(
        is_active=True,
        remaining_minutes=remaining,
        current_subject=current_subject,
        session_id=session.id,
    )
