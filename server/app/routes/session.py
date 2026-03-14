"""Session API routes — /api/session endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.session import (
    CheckInRequest,
    CheckInResponse,
    SessionEndRequest,
    SessionEndResponse,
    SessionStartRequest,
    SessionStartResponse,
)
from app.services import session_service

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
