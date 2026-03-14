"""UserProfile model — stores student cognitive profile."""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    name: Mapped[str] = mapped_column(String(100))
    adhd_type: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # inattentive, hyperactive, combined, none
    medications: Mapped[str] = mapped_column(
        Text, default="[]"
    )  # JSON array: [{"name": "Vyvanse", "dosage": "30mg", "typical_time": "08:00"}]
    courses: Mapped[str] = mapped_column(
        Text, default="[]"
    )  # JSON array: [{"name": "Organic Chemistry", "deadline": "2026-03-20", "difficulty": 4}]
    preferred_study_times: Mapped[str] = mapped_column(
        Text, default="[]"
    )  # JSON array: ["morning", "afternoon"]
    energy_pattern: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True
    )  # morning, afternoon, evening
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
