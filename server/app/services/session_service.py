"""Session service — manages study session lifecycle with LLM-powered AI.

Uses Groq/LLaMA 3.3 via RAG pipeline for session plans, adaptations, and reports.
Falls back to stub logic if the LLM call fails (hackathon resilience).
"""

import json
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import FocusCheckIn, StudySession
from app.models.user import UserProfile
from app.prompts import adaptation as adaptation_prompts
from app.prompts import report as report_prompts
from app.prompts import session_planner as planner_prompts
from app.rag.pipeline import format_rag_context, query_knowledge
from app.schemas.session import (
    AdaptationSuggestion,
    CheckInRequest,
    CheckInResponse,
    FocusDataPoint,
    SessionEndRequest,
    SessionEndResponse,
    SessionPlan,
    SessionRecommendation,
    SessionReport,
    SessionStartRequest,
    SessionStartResponse,
)
from app.services import llm_service

logger = logging.getLogger(__name__)

# Adaptation threshold: consecutive low-focus check-ins to trigger intervention
FOCUS_DROP_THRESHOLD = 2
LOW_FOCUS_CUTOFF = 2


def _build_profile_context(profile: UserProfile) -> str:
    """Build a profile context string for LLM prompts."""
    medications = json.loads(profile.medications) if profile.medications else []
    courses = json.loads(profile.courses) if profile.courses else []
    study_times = json.loads(profile.preferred_study_times) if profile.preferred_study_times else []

    med_str = ", ".join(f"{m['name']} {m['dosage']} at {m['typical_time']}" for m in medications) or "None"
    course_str = ", ".join(
        f"{c['name']} (difficulty: {c.get('difficulty', 'N/A')}, deadline: {c.get('deadline', 'N/A')})"
        for c in courses
    ) or "None"

    return f"""- Name: {profile.name}
- ADHD Type: {profile.adhd_type or 'Not specified'}
- Medications: {med_str}
- Courses: {course_str}
- Preferred study times: {', '.join(study_times) or 'Not specified'}
- Energy pattern: {profile.energy_pattern or 'Not specified'}"""


async def _get_profile(db: AsyncSession, user_id: str) -> Optional[UserProfile]:
    """Fetch user profile by ID."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.id == user_id)
    )
    return result.scalar_one_or_none()


async def start_session(
    db: AsyncSession, data: SessionStartRequest
) -> SessionStartResponse:
    """Create a new study session and generate an AI session plan."""

    # Fetch profile for context
    profile = await _get_profile(db, data.user_id)
    profile_context = _build_profile_context(profile) if profile else "No profile available"

    # Query RAG for relevant study strategies
    rag_query = f"study session planning ADHD energy level {data.energy_level} subjects {' '.join(data.subjects)}"
    if data.medication_taken_at:
        rag_query += f" medication timing {data.medication_taken_at}"
    rag_chunks = query_knowledge(rag_query, top_k=5)
    rag_context = format_rag_context(rag_chunks)

    # Generate plan via LLM
    plan = await _generate_llm_plan(
        profile_context, rag_context, data.subjects,
        data.available_minutes, data.energy_level, data.medication_taken_at,
    )

    session = StudySession(
        user_id=data.user_id,
        initial_energy=data.energy_level,
        planned_duration_min=data.available_minutes,
        subjects=json.dumps(data.subjects),
        session_plan=plan.model_dump_json(),
        medication_time=data.medication_taken_at,
        status="active",
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)

    return SessionStartResponse(
        session_id=session.id,
        plan=plan,
        started_at=session.started_at,
    )


async def record_checkin(
    db: AsyncSession, data: CheckInRequest
) -> CheckInResponse:
    """Record a focus check-in and determine if adaptation is needed."""

    # Check for consecutive low-focus check-ins (order by id for reliable ordering)
    result = await db.execute(
        select(FocusCheckIn)
        .where(FocusCheckIn.session_id == data.session_id)
        .order_by(FocusCheckIn.id.desc())
        .limit(FOCUS_DROP_THRESHOLD - 1)
    )
    recent_checkins = list(result.scalars().all())

    # Determine if adaptation is needed
    adaptation_needed = False
    suggestion: Optional[AdaptationSuggestion] = None

    low_streak = all(c.focus_level <= LOW_FOCUS_CUTOFF for c in recent_checkins)
    if data.focus_level <= LOW_FOCUS_CUTOFF and low_streak and len(recent_checkins) >= (FOCUS_DROP_THRESHOLD - 1):
        adaptation_needed = True
        suggestion = await _generate_llm_adaptation(db, data)

    checkin = FocusCheckIn(
        session_id=data.session_id,
        focus_level=data.focus_level,
        block_number=data.block_number,
        subject=data.subject,
        adaptation_triggered=adaptation_needed,
        adaptation_suggestion=(
            suggestion.model_dump_json() if suggestion else None
        ),
    )
    db.add(checkin)
    await db.flush()
    await db.refresh(checkin)

    return CheckInResponse(
        checkin_id=checkin.id,
        adaptation_needed=adaptation_needed,
        suggestion=suggestion,
    )


async def end_session(
    db: AsyncSession, data: SessionEndRequest
) -> SessionEndResponse:
    """End a session and generate an AI coaching report."""

    result = await db.execute(
        select(StudySession).where(StudySession.id == data.session_id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise ValueError(f"Session {data.session_id} not found")

    # Fetch all check-ins for this session
    checkin_result = await db.execute(
        select(FocusCheckIn)
        .where(FocusCheckIn.session_id == data.session_id)
        .order_by(FocusCheckIn.timestamp.asc())
    )
    checkins = list(checkin_result.scalars().all())

    # Calculate session metrics
    now = datetime.now(timezone.utc)
    session.ended_at = now
    session.status = "completed"

    if session.started_at:
        started = session.started_at.replace(tzinfo=timezone.utc) if session.started_at.tzinfo is None else session.started_at
        session.actual_duration_min = int((now - started).total_seconds() / 60)

    # Build focus data
    focus_data = [
        FocusDataPoint(
            timestamp=c.timestamp,
            focus_level=c.focus_level,
            block_number=c.block_number,
            subject=c.subject,
        )
        for c in checkins
    ]

    avg_focus = (
        sum(c.focus_level for c in checkins) / len(checkins) if checkins else 0.0
    )
    blocks_completed = max((c.block_number for c in checkins), default=0)
    subjects_studied = list(set(c.subject for c in checkins))

    # Get previous session avg for comparison
    prev_avg = await _get_previous_session_avg(db, session.user_id, session.id)

    # Generate report via LLM
    report = await _generate_llm_report(
        db, session, checkins, focus_data, avg_focus,
        blocks_completed, subjects_studied, prev_avg,
    )

    session.ai_report = report.model_dump_json()
    await db.flush()

    return SessionEndResponse(
        session_id=session.id,
        status="completed",
        report=report,
    )


async def _get_previous_session_avg(
    db: AsyncSession, user_id: str, current_session_id: str
) -> Optional[float]:
    """Get the average focus from the user's most recent completed session."""
    result = await db.execute(
        select(StudySession)
        .where(
            StudySession.user_id == user_id,
            StudySession.status == "completed",
            StudySession.id != current_session_id,
        )
        .order_by(StudySession.ended_at.desc())
        .limit(1)
    )
    prev_session = result.scalar_one_or_none()
    if prev_session is None:
        return None

    checkin_result = await db.execute(
        select(FocusCheckIn)
        .where(FocusCheckIn.session_id == prev_session.id)
    )
    prev_checkins = list(checkin_result.scalars().all())
    if not prev_checkins:
        return None

    return sum(c.focus_level for c in prev_checkins) / len(prev_checkins)


async def _generate_llm_plan(
    profile_context: str,
    rag_context: str,
    subjects: list[str],
    available_minutes: int,
    energy_level: int,
    medication_taken_at: str | None,
) -> SessionPlan:
    """Generate a session plan via LLM, falling back to stub on failure."""
    try:
        user_prompt = planner_prompts.build_user_prompt(
            profile_context=profile_context,
            rag_context=rag_context,
            subjects=subjects,
            available_minutes=available_minutes,
            energy_level=energy_level,
            medication_taken_at=medication_taken_at,
        )

        result = await llm_service.generate_json(
            system_prompt=planner_prompts.SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.3,
        )

        if "raw_response" not in result:
            return SessionPlan(**result)

    except Exception as e:
        logger.warning(f"LLM plan generation failed, using stub: {e}")

    # Fallback to stub plan
    return _generate_stub_plan(subjects, available_minutes, energy_level)


async def _generate_llm_adaptation(
    db: AsyncSession, data: CheckInRequest
) -> AdaptationSuggestion:
    """Generate an adaptation suggestion via LLM, falling back to stub on failure."""
    try:
        # Fetch session and profile
        session_result = await db.execute(
            select(StudySession).where(StudySession.id == data.session_id)
        )
        session = session_result.scalar_one_or_none()

        profile = None
        profile_context = "No profile available"
        available_subjects: list[str] = []
        medication_taken_at = None
        session_duration = 0

        if session:
            profile = await _get_profile(db, session.user_id)
            profile_context = _build_profile_context(profile) if profile else profile_context
            available_subjects = json.loads(session.subjects) if session.subjects else []
            medication_taken_at = session.medication_time
            if session.started_at:
                started = session.started_at.replace(tzinfo=timezone.utc) if session.started_at.tzinfo is None else session.started_at
                session_duration = int((datetime.now(timezone.utc) - started).total_seconds() / 60)

        # Get recent focus levels
        checkin_result = await db.execute(
            select(FocusCheckIn)
            .where(FocusCheckIn.session_id == data.session_id)
            .order_by(FocusCheckIn.timestamp.desc())
            .limit(5)
        )
        recent = list(checkin_result.scalars().all())
        recent_focus_levels = [c.focus_level for c in reversed(recent)]

        # Query RAG
        rag_chunks = query_knowledge(
            f"focus dropping low ADHD adaptation study break subject switching",
            top_k=3,
        )
        rag_context = format_rag_context(rag_chunks)

        user_prompt = adaptation_prompts.build_user_prompt(
            profile_context=profile_context,
            rag_context=rag_context,
            current_subject=data.subject,
            block_number=data.block_number,
            focus_level=data.focus_level,
            recent_focus_levels=recent_focus_levels,
            available_subjects=available_subjects,
            session_duration_so_far_min=session_duration,
            medication_taken_at=medication_taken_at,
        )

        result = await llm_service.generate_json(
            system_prompt=adaptation_prompts.SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.3,
        )

        if "raw_response" not in result:
            return AdaptationSuggestion(**result)

    except Exception as e:
        logger.warning(f"LLM adaptation generation failed, using stub: {e}")

    # Fallback to stub
    return _generate_stub_adaptation(data.subject, data.block_number)


async def _generate_llm_report(
    db: AsyncSession,
    session: StudySession,
    checkins: list[FocusCheckIn],
    focus_data: list[FocusDataPoint],
    avg_focus: float,
    blocks_completed: int,
    subjects_studied: list[str],
    previous_session_avg: Optional[float],
) -> SessionReport:
    """Generate a session report via LLM, falling back to stub on failure."""
    try:
        profile = await _get_profile(db, session.user_id)
        profile_context = _build_profile_context(profile) if profile else "No profile available"

        # Query RAG for report context
        rag_chunks = query_knowledge(
            f"study session report coaching ADHD focus analysis average {avg_focus}",
            top_k=3,
        )
        rag_context = format_rag_context(rag_chunks)

        focus_data_dicts = [
            {
                "block_number": d.block_number,
                "subject": d.subject,
                "focus_level": d.focus_level,
                "timestamp": d.timestamp.isoformat() if d.timestamp else "unknown",
            }
            for d in focus_data
        ]

        user_prompt = report_prompts.build_user_prompt(
            profile_context=profile_context,
            rag_context=rag_context,
            total_duration_min=session.actual_duration_min or 0,
            blocks_completed=blocks_completed,
            average_focus=avg_focus,
            focus_data=focus_data_dicts,
            subjects_studied=subjects_studied,
            medication_taken_at=session.medication_time,
            previous_session_avg_focus=previous_session_avg,
        )

        result = await llm_service.generate_json(
            system_prompt=report_prompts.SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.5,
        )

        if "raw_response" not in result:
            # Build the full report, merging LLM output with session data
            recommendations = [
                SessionRecommendation(text=r["text"], category=r["category"])
                for r in result.get("recommendations", [])
            ]

            return SessionReport(
                session_id=session.id,
                summary=result.get("summary", f"Session completed: {blocks_completed} blocks, avg focus {avg_focus:.1f}/5."),
                total_duration_min=session.actual_duration_min or 0,
                blocks_completed=blocks_completed,
                average_focus=round(avg_focus, 2),
                peak_focus_time=result.get("peak_focus_time"),
                low_focus_time=result.get("low_focus_time"),
                focus_data=focus_data,
                recommendations=recommendations if recommendations else [
                    SessionRecommendation(
                        text="Keep tracking your focus to discover your patterns.",
                        category="general",
                    )
                ],
                encouragement=result.get(
                    "encouragement",
                    "Every study session is progress. You showed up, and that matters."
                ),
            )

    except Exception as e:
        logger.warning(f"LLM report generation failed, using stub: {e}")

    # Fallback to stub report
    return SessionReport(
        session_id=session.id,
        summary=(
            f"You studied for {session.actual_duration_min or 0} minutes "
            f"across {blocks_completed} blocks. Average focus: {avg_focus:.1f}/5."
        ),
        total_duration_min=session.actual_duration_min or 0,
        blocks_completed=blocks_completed,
        average_focus=round(avg_focus, 2),
        peak_focus_time=None,
        low_focus_time=None,
        focus_data=focus_data,
        recommendations=[
            SessionRecommendation(
                text="Great job completing your session! Keep tracking your focus to discover your patterns.",
                category="general",
            )
        ],
        encouragement="Every study session is progress. You showed up, and that matters.",
    )


def _generate_stub_plan(
    subjects: list[str], available_minutes: int, energy_level: int
) -> SessionPlan:
    """Generate a basic session plan without LLM. Fallback for when LLM is unavailable."""
    block_min = max(15, min(45, energy_level * 10))
    break_min = 5 if energy_level >= 3 else 10

    blocks = []
    breaks = []
    remaining = available_minutes
    order = 1

    for subject in subjects:
        if remaining <= 0:
            break
        duration = min(block_min, remaining)
        blocks.append({
            "order": order,
            "subject": subject,
            "duration_min": duration,
            "study_method": "active recall",
            "notes": None,
        })
        remaining -= duration
        order += 1

        if remaining > break_min:
            breaks.append({
                "after_block": order - 1,
                "duration_min": break_min,
                "activity": "movement break",
            })
            remaining -= break_min

    total_study = sum(b["duration_min"] for b in blocks)
    total_break = sum(b["duration_min"] for b in breaks)

    return SessionPlan(
        blocks=blocks,
        breaks=breaks,
        total_study_min=total_study,
        total_break_min=total_break,
        strategy_notes="Generated with basic logic. AI-powered plans require a Groq API key.",
    )


def _generate_stub_adaptation(subject: str, block_number: int) -> AdaptationSuggestion:
    """Generate a basic adaptation suggestion without LLM. Fallback."""
    return AdaptationSuggestion(
        action="take_break",
        message=(
            f"Your focus has been low for the past couple of check-ins on {subject}. "
            "Let's take a 5-minute movement break - stretch, walk, or grab water. "
            "You've been doing great so far."
        ),
        break_duration_min=5,
    )
