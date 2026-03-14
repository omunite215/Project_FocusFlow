"""Dashboard service — aggregation queries for longitudinal analytics."""

import json

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import FocusCheckIn, StudySession
from app.schemas.dashboard import (
    DashboardResponse,
    SessionSummary,
    SubjectAverage,
    StudyTimeSlot,
)


async def get_dashboard(db: AsyncSession, user_id: str) -> DashboardResponse:
    """Build longitudinal dashboard data for a user."""

    # Fetch all completed sessions
    result = await db.execute(
        select(StudySession)
        .where(
            StudySession.user_id == user_id,
            StudySession.status == "completed",
        )
        .order_by(StudySession.started_at.desc())
    )
    sessions = list(result.scalars().all())

    if not sessions:
        return DashboardResponse(
            total_sessions=0,
            total_study_minutes=0,
            avg_focus=0.0,
            focus_trend=[],
            best_study_times=[],
            subject_averages=[],
        )

    # Session summaries with focus averages
    focus_trend: list[SessionSummary] = []
    total_minutes = 0
    all_focus_values: list[float] = []

    # Subject tracking
    subject_data: dict[str, dict] = {}  # {subject: {total_focus, count, minutes}}
    # Time-of-day tracking
    hour_data: dict[int, dict] = {}  # {hour: {total_focus, count}}

    for session in sessions:
        # Get check-ins for this session
        checkin_result = await db.execute(
            select(FocusCheckIn)
            .where(FocusCheckIn.session_id == session.id)
            .order_by(FocusCheckIn.timestamp.asc())
        )
        checkins = list(checkin_result.scalars().all())

        duration = session.actual_duration_min or 0
        total_minutes += duration

        if checkins:
            avg = sum(c.focus_level for c in checkins) / len(checkins)
            all_focus_values.append(avg)

            # Per-subject aggregation
            for c in checkins:
                if c.subject not in subject_data:
                    subject_data[c.subject] = {"total_focus": 0, "count": 0, "minutes": 0}
                subject_data[c.subject]["total_focus"] += c.focus_level
                subject_data[c.subject]["count"] += 1

            # Time-of-day aggregation
            if session.started_at:
                hour = session.started_at.hour
                if hour not in hour_data:
                    hour_data[hour] = {"total_focus": 0.0, "count": 0}
                hour_data[hour]["total_focus"] += avg
                hour_data[hour]["count"] += 1
        else:
            avg = 0.0

        subjects = json.loads(session.subjects) if session.subjects else []
        focus_trend.append(
            SessionSummary(
                session_id=session.id,
                date=session.started_at.isoformat() if session.started_at else "",
                duration_min=duration,
                average_focus=round(avg, 2),
                subjects=subjects,
                status=session.status,
            )
        )

    overall_avg = (
        sum(all_focus_values) / len(all_focus_values) if all_focus_values else 0.0
    )

    # Build subject averages
    subject_averages = [
        SubjectAverage(
            subject=subj,
            average_focus=round(data["total_focus"] / data["count"], 2),
            total_minutes=data.get("minutes", 0),
            session_count=data["count"],
        )
        for subj, data in subject_data.items()
    ]

    # Build study time slots
    best_study_times = sorted(
        [
            StudyTimeSlot(
                hour=hour,
                average_focus=round(data["total_focus"] / data["count"], 2),
                session_count=data["count"],
            )
            for hour, data in hour_data.items()
        ],
        key=lambda x: x.average_focus,
        reverse=True,
    )

    return DashboardResponse(
        total_sessions=len(sessions),
        total_study_minutes=total_minutes,
        avg_focus=round(overall_avg, 2),
        focus_trend=focus_trend,
        best_study_times=best_study_times,
        subject_averages=subject_averages,
    )
