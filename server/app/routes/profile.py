"""Profile API routes — /api/profile endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate
from app.services import profile_service

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.post("", response_model=ProfileResponse, status_code=201)
async def create_profile(
    data: ProfileCreate, db: AsyncSession = Depends(get_db)
) -> ProfileResponse:
    """Create a new student cognitive profile."""
    return await profile_service.create_profile(db, data)


@router.get("", response_model=list[ProfileResponse])
async def list_profiles(
    db: AsyncSession = Depends(get_db),
) -> list[ProfileResponse]:
    """List all profiles (hackathon convenience — no auth)."""
    return await profile_service.list_profiles(db)


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(
    profile_id: str, db: AsyncSession = Depends(get_db)
) -> ProfileResponse:
    """Retrieve a student profile by ID."""
    profile = await profile_service.get_profile(db, profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(
    profile_id: str,
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    """Update an existing student profile."""
    profile = await profile_service.update_profile(db, profile_id, data)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
