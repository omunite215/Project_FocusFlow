"""Profile service — handles CRUD for student cognitive profiles."""

import json
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserProfile
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate


async def create_profile(db: AsyncSession, data: ProfileCreate) -> ProfileResponse:
    """Create a new user profile."""
    profile = UserProfile(
        name=data.name,
        adhd_type=data.adhd_type,
        medications=json.dumps([m.model_dump() for m in data.medications]),
        courses=json.dumps([c.model_dump() for c in data.courses]),
        preferred_study_times=json.dumps(data.preferred_study_times),
        energy_pattern=data.energy_pattern,
    )
    db.add(profile)
    await db.flush()
    await db.refresh(profile)
    return _to_response(profile)


async def get_profile(db: AsyncSession, profile_id: str) -> Optional[ProfileResponse]:
    """Retrieve a profile by ID."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        return None
    return _to_response(profile)


async def update_profile(
    db: AsyncSession, profile_id: str, data: ProfileUpdate
) -> Optional[ProfileResponse]:
    """Update an existing profile. Only updates provided fields."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        return None

    if data.name is not None:
        profile.name = data.name
    if data.adhd_type is not None:
        profile.adhd_type = data.adhd_type
    if data.medications is not None:
        profile.medications = json.dumps([m.model_dump() for m in data.medications])
    if data.courses is not None:
        profile.courses = json.dumps([c.model_dump() for c in data.courses])
    if data.preferred_study_times is not None:
        profile.preferred_study_times = json.dumps(data.preferred_study_times)
    if data.energy_pattern is not None:
        profile.energy_pattern = data.energy_pattern

    await db.flush()
    await db.refresh(profile)
    return _to_response(profile)


async def list_profiles(db: AsyncSession) -> list[ProfileResponse]:
    """List all profiles (hackathon convenience — no auth)."""
    result = await db.execute(select(UserProfile))
    profiles = result.scalars().all()
    return [_to_response(p) for p in profiles]


def _to_response(profile: UserProfile) -> ProfileResponse:
    """Convert ORM model to response schema, parsing JSON fields."""
    return ProfileResponse(
        id=profile.id,
        name=profile.name,
        adhd_type=profile.adhd_type,
        medications=json.loads(profile.medications) if profile.medications else [],
        courses=json.loads(profile.courses) if profile.courses else [],
        preferred_study_times=(
            json.loads(profile.preferred_study_times)
            if profile.preferred_study_times
            else []
        ),
        energy_pattern=profile.energy_pattern,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )
