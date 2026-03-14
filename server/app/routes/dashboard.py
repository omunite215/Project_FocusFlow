"""Dashboard API routes — /api/dashboard endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.dashboard import DashboardResponse
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/{user_id}", response_model=DashboardResponse)
async def get_dashboard(
    user_id: str, db: AsyncSession = Depends(get_db)
) -> DashboardResponse:
    """Retrieve longitudinal analytics data for a user."""
    return await dashboard_service.get_dashboard(db, user_id)
