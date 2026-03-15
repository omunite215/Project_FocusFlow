"""Prompt templates for real-time focus adaptation suggestions."""

SYSTEM_PROMPT = """You are FocusFlow, an ADHD-informed study coach AI. A student's focus has dropped during their study session and you need to provide a helpful, non-judgmental intervention.

IMPORTANT RULES:
- NEVER use guilt, shame, or pressure. Focus drops are normal, not failures.
- Be specific: name the exact action, duration, and reason.
- Consider what subject they're on, how long they've been studying, and their profile.
- Suggest ONE clear action. Don't overwhelm with options.

Available actions:
- "switch_subject": Switch to a different subject from their plan.
- "take_break": Take a specific type of break with a duration.
- "change_method": Switch to a different study technique for the same subject.
- "end_session": Gently suggest ending the session if they've done enough.
- "reorder_plan": Reorder remaining study blocks based on current focus/energy. Put easier subjects first when focus is low, harder subjects first when focus is high.

OUTPUT FORMAT:
You MUST respond with valid JSON only. No text before or after the JSON.
{
  "action": "take_break",
  "message": "A warm, encouraging message explaining the suggestion. 2-3 sentences max.",
  "new_subject": null,
  "break_duration_min": 10,
  "new_method": null,
  "suggested_block_order": null
}

For switch_subject, populate new_subject. For change_method, populate new_method. For take_break, populate break_duration_min. For end_session, all optional fields are null. For reorder_plan, populate suggested_block_order with an array of block indices (0-based) representing the new order of ALL blocks."""


def build_user_prompt(
    profile_context: str,
    rag_context: str,
    current_subject: str,
    block_number: int,
    focus_level: int,
    recent_focus_levels: list[int],
    available_subjects: list[str],
    session_duration_so_far_min: int,
    medication_taken_at: str | None,
    plan_blocks: list[dict] | None = None,
) -> str:
    """Build the user prompt for adaptation suggestion."""
    med_info = f"Medication taken at: {medication_taken_at}" if medication_taken_at else "No medication today"
    focus_history = ", ".join(str(f) for f in recent_focus_levels)
    other_subjects = [s for s in available_subjects if s != current_subject]

    plan_section = ""
    if plan_blocks:
        block_lines = []
        for i, b in enumerate(plan_blocks):
            difficulty = b.get("difficulty", "unknown")
            block_lines.append(f"  [{i}] {b['subject']} — {b['duration_min']}min, method: {b['study_method']}, difficulty: {difficulty}")
        plan_section = f"\n- Current plan blocks (index, subject, duration, method, difficulty):\n" + "\n".join(block_lines)

    return f"""## Student Profile
{profile_context}

## Relevant Knowledge
{rag_context}

## Current Situation
- Currently studying: {current_subject}
- Current block number: {block_number}
- Current focus level: {focus_level}/5
- Recent focus levels: [{focus_history}]
- Time studied so far: {session_duration_so_far_min} minutes
- {med_info}
- Other available subjects: {', '.join(other_subjects) if other_subjects else 'None'}{plan_section}

The student's focus has been consistently low. Suggest one specific intervention to help them. Consider using "reorder_plan" if the remaining blocks could be rearranged to match their current energy (easier subjects first when focus is low). Remember: this is not their fault — ADHD brains have limited focus reserves."""
