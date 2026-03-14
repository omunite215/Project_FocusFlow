"""StudySession and FocusCheckIn models — session lifecycle and focus tracking."""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("user_profiles.id"), index=True
    )
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    initial_energy: Mapped[int] = mapped_column(Integer)  # 1-5
    planned_duration_min: Mapped[int] = mapped_column(Integer)
    actual_duration_min: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    subjects: Mapped[str] = mapped_column(Text)  # JSON array
    session_plan: Mapped[str] = mapped_column(Text, default="{}")  # AI-generated plan JSON
    medication_time: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True
    )  # e.g. "08:30"
    ai_report: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # Generated report text
    status: Mapped[str] = mapped_column(
        String(20), default="active"
    )  # active, completed, abandoned

    # Relationships
    checkins: Mapped[list["FocusCheckIn"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class FocusCheckIn(Base):
    __tablename__ = "focus_checkins"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("study_sessions.id"), index=True
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    focus_level: Mapped[int] = mapped_column(Integer)  # 1-5
    block_number: Mapped[int] = mapped_column(Integer)
    subject: Mapped[str] = mapped_column(String(100))
    adaptation_triggered: Mapped[bool] = mapped_column(Boolean, default=False)
    adaptation_suggestion: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )

    # Relationships
    session: Mapped["StudySession"] = relationship(back_populates="checkins")
