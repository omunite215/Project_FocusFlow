"""Pydantic v2 schemas for study sessions, check-ins, and reports."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# --- Session Start ---

class StudyBlock(BaseModel):
    """A single study block within a session plan."""
    order: int
    subject: str
    duration_min: int
    study_method: str = Field(..., examples=["active recall", "practice problems", "review notes"])
    notes: Optional[str] = None


class BreakBlock(BaseModel):
    """A break within a session plan."""
    after_block: int
    duration_min: int
    activity: str = Field(..., examples=["movement break", "hydration", "breathing exercise"])


class SessionPlan(BaseModel):
    """AI-generated study session plan."""
    blocks: list[StudyBlock]
    breaks: list[BreakBlock]
    total_study_min: int
    total_break_min: int
    strategy_notes: str = ""


class SessionStartRequest(BaseModel):
    user_id: str
    energy_level: int = Field(..., ge=1, le=5)
    subjects: list[str] = Field(..., min_length=1)
    available_minutes: int = Field(..., ge=10, le=480)
    medication_taken_at: Optional[str] = Field(
        None, pattern=r"^\d{2}:\d{2}$", examples=["08:30"]
    )


class SessionStartResponse(BaseModel):
    session_id: str
    plan: SessionPlan
    started_at: datetime


# --- Focus Check-in ---

class CheckInRequest(BaseModel):
    session_id: str
    focus_level: int = Field(..., ge=1, le=5)
    block_number: int = Field(..., ge=1)
    subject: str


class AdaptationSuggestion(BaseModel):
    action: str = Field(
        ..., examples=["switch_subject", "take_break", "change_method", "end_session", "reorder_plan"]
    )
    message: str
    new_subject: Optional[str] = None
    break_duration_min: Optional[int] = None
    new_method: Optional[str] = None
    suggested_block_order: Optional[list[int]] = None


class CheckInResponse(BaseModel):
    checkin_id: int
    adaptation_needed: bool
    suggestion: Optional[AdaptationSuggestion] = None


# --- Session End ---

class SessionEndRequest(BaseModel):
    session_id: str


class FocusDataPoint(BaseModel):
    timestamp: datetime
    focus_level: int
    block_number: int
    subject: str


class SessionRecommendation(BaseModel):
    text: str
    category: str = Field(
        ..., examples=["timing", "method", "subject_order", "breaks", "medication"]
    )


class SessionReport(BaseModel):
    session_id: str
    summary: str
    total_duration_min: int
    blocks_completed: int
    average_focus: float
    peak_focus_time: Optional[str] = None
    low_focus_time: Optional[str] = None
    focus_data: list[FocusDataPoint]
    recommendations: list[SessionRecommendation]
    encouragement: str  # Always positive, never guilt-based


class SessionEndResponse(BaseModel):
    session_id: str
    status: str
    report: SessionReport
