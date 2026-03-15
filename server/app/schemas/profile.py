"""Pydantic v2 schemas for student cognitive profile."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class MedicationItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, examples=["Vyvanse"])
    dosage: Optional[str] = Field("", max_length=50, examples=["30mg"])
    typical_time: Optional[str] = Field("", examples=["08:00"])


class CourseItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, examples=["Organic Chemistry"])
    deadline: Optional[str] = Field(None, examples=["2026-03-20"])
    difficulty: int = Field(3, ge=1, le=5)


class ProfileCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    adhd_type: Optional[str] = None
    medications: list[MedicationItem] = Field(default_factory=list)
    courses: list[CourseItem] = Field(default_factory=list)
    preferred_study_times: list[str] = Field(default_factory=list)
    energy_pattern: Optional[str] = None

    @field_validator("adhd_type", mode="before")
    @classmethod
    def empty_adhd_to_none(cls, v):
        if v == "":
            return None
        return v

    @field_validator("energy_pattern", mode="before")
    @classmethod
    def empty_energy_to_none(cls, v):
        if v == "":
            return None
        return v

    @field_validator("preferred_study_times")
    @classmethod
    def validate_study_times(cls, v: list[str]) -> list[str]:
        valid = {"morning", "afternoon", "evening", "night"}
        for t in v:
            if t not in valid:
                raise ValueError(f"Invalid study time: {t}. Must be one of {valid}")
        return v


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    adhd_type: Optional[str] = None
    medications: Optional[list[MedicationItem]] = None
    courses: Optional[list[CourseItem]] = None
    preferred_study_times: Optional[list[str]] = None
    energy_pattern: Optional[str] = None

    @field_validator("adhd_type", mode="before")
    @classmethod
    def empty_adhd_to_none(cls, v):
        if v == "":
            return None
        return v

    @field_validator("energy_pattern", mode="before")
    @classmethod
    def empty_energy_to_none(cls, v):
        if v == "":
            return None
        return v


class ProfileResponse(BaseModel):
    id: str
    name: str
    adhd_type: Optional[str] = None
    medications: list[MedicationItem] = []
    courses: list[CourseItem] = []
    preferred_study_times: list[str] = []
    energy_pattern: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
