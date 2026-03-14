"""Pydantic v2 schemas for longitudinal dashboard data."""

from pydantic import BaseModel


class SessionSummary(BaseModel):
    session_id: str
    date: str
    duration_min: int
    average_focus: float
    subjects: list[str]
    status: str


class SubjectAverage(BaseModel):
    subject: str
    average_focus: float
    total_minutes: int
    session_count: int


class StudyTimeSlot(BaseModel):
    hour: int  # 0-23
    average_focus: float
    session_count: int


class DashboardResponse(BaseModel):
    total_sessions: int
    total_study_minutes: int
    avg_focus: float
    focus_trend: list[SessionSummary]
    best_study_times: list[StudyTimeSlot]
    subject_averages: list[SubjectAverage]
