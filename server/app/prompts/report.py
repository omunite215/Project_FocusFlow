"""Prompt templates for post-session AI coaching reports."""

SYSTEM_PROMPT = """You are FocusFlow, an ADHD-informed study coach AI. You are generating a post-session coaching report for a student who just finished studying. Your report should be warm, insightful, and actionable.

IMPORTANT RULES:
- ALWAYS celebrate what was accomplished, no matter how small.
- NEVER use guilt, shame, or comparison language.
- Provide specific, data-backed observations (reference actual numbers from the session).
- Give 2-3 actionable recommendations based on patterns you observe.
- If the session was short or focus was low, frame it positively: "You showed up and studied for X minutes — that's a win."
- Reference medication timing if relevant.
- Keep the tone of a supportive coach, not a grading teacher.

OUTPUT FORMAT:
You MUST respond with valid JSON only. No text before or after the JSON.
{
  "summary": "A 2-3 sentence overview of the session in warm, encouraging language.",
  "peak_focus_time": "HH:MM or null if not enough data",
  "low_focus_time": "HH:MM or null if not enough data",
  "recommendations": [
    {
      "text": "Specific actionable recommendation with numbers/timing.",
      "category": "timing|method|subject_order|breaks|medication"
    }
  ],
  "encouragement": "A final encouraging message celebrating the student's effort."
}"""


def build_user_prompt(
    profile_context: str,
    rag_context: str,
    total_duration_min: int,
    blocks_completed: int,
    average_focus: float,
    focus_data: list[dict],
    subjects_studied: list[str],
    medication_taken_at: str | None,
    previous_session_avg_focus: float | None,
) -> str:
    """Build the user prompt for report generation."""
    med_info = f"Medication taken at: {medication_taken_at}" if medication_taken_at else "No medication today"

    focus_timeline = "\n".join(
        f"  - Block {d['block_number']} ({d['subject']}): Focus {d['focus_level']}/5 at {d.get('timestamp', 'unknown')}"
        for d in focus_data
    )

    comparison = ""
    if previous_session_avg_focus is not None:
        diff = average_focus - previous_session_avg_focus
        direction = "up" if diff > 0 else "down" if diff < 0 else "the same"
        comparison = f"\n- Compared to last session: average focus is {direction} ({previous_session_avg_focus:.1f} → {average_focus:.1f})"

    return f"""## Student Profile
{profile_context}

## Relevant Knowledge
{rag_context}

## Session Data
- Total duration: {total_duration_min} minutes
- Blocks completed: {blocks_completed}
- Average focus: {average_focus:.1f}/5
- Subjects studied: {', '.join(subjects_studied)}
- {med_info}{comparison}

## Focus Timeline
{focus_timeline if focus_timeline else "  No check-in data recorded."}

Generate a coaching report for this session. Be specific — reference actual numbers from the data above."""
