// FocusFlow mock data — mirrors exact backend API response schemas.
// Remove mocks/mockService.js import from main.jsx when backend is ready.

export const mockProfile = {
  id: "user-1",
  name: "Alex",
  adhd_type: "combined",
  medications: [
    { name: "Adderall XR", dosage: "20mg", typical_time: "08:00" },
  ],
  courses: [
    { name: "Calculus II", deadline: "2026-04-10", difficulty: 4 },
    { name: "Intro Psychology", deadline: "2026-04-15", difficulty: 2 },
    { name: "Data Structures", deadline: "2026-03-28", difficulty: 5 },
  ],
  preferred_study_times: ["morning", "afternoon"],
  energy_pattern: "morning",
  created_at: "2026-03-14T10:00:00Z",
  updated_at: "2026-03-14T10:00:00Z",
};

export const mockSessionStart = {
  session_id: "sess-1",
  started_at: "2026-03-14T10:00:00Z",
  plan: {
    blocks: [
      {
        order: 1,
        subject: "Data Structures",
        duration_min: 30,
        study_method: "Active Recall",
        notes: "Hardest subject first while medication is at peak.",
      },
      {
        order: 2,
        subject: "Calculus II",
        duration_min: 35,
        study_method: "Practice Problems",
        notes: null,
      },
      {
        order: 3,
        subject: "Intro Psychology",
        duration_min: 25,
        study_method: "Summarization",
        notes: "Lighter subject for cooldown.",
      },
    ],
    breaks: [
      { after_block: 1, duration_min: 5, activity: "Stretch or walk" },
      { after_block: 2, duration_min: 5, activity: "Hydration break" },
    ],
    total_study_min: 90,
    total_break_min: 10,
    strategy_notes:
      "Starting with Data Structures — your closest deadline and hardest subject — while your medication is at peak effectiveness. Calculus follows during your strong focus window. Ending with Psychology as a lighter cooldown.",
  },
};

export const mockCheckInResponses = [
  { checkin_id: 1, adaptation_needed: false, suggestion: null },
  { checkin_id: 2, adaptation_needed: false, suggestion: null },
  { checkin_id: 3, adaptation_needed: false, suggestion: null },
  { checkin_id: 4, adaptation_needed: false, suggestion: null },
  {
    checkin_id: 5,
    adaptation_needed: true,
    suggestion: {
      action: "change_method",
      message:
        "Your focus has been dipping. Let's try switching things up — a different approach can re-engage your attention.",
      new_subject: null,
      break_duration_min: null,
      new_method: "Mind Mapping",
    },
  },
  {
    checkin_id: 6,
    adaptation_needed: true,
    suggestion: {
      action: "take_break",
      message:
        "You've been working hard. A 5-minute movement break can reset your focus better than pushing through.",
      new_subject: null,
      break_duration_min: 5,
      new_method: null,
    },
  },
];

export const mockSessionEnd = {
  session_id: "sess-1",
  status: "completed",
  report: {
    session_id: "sess-1",
    summary:
      "You studied for 87 minutes across 3 subjects. Focus was strongest during Data Structures (avg 4.5) and dipped toward the end. Great job tackling your hardest subject first!",
    total_duration_min: 87,
    blocks_completed: 3,
    average_focus: 3.3,
    peak_focus_time: "10:30 AM",
    low_focus_time: "11:40 AM",
    focus_data: [
      { timestamp: "2026-03-14T10:15:00Z", focus_level: 4, block_number: 1, subject: "Data Structures" },
      { timestamp: "2026-03-14T10:30:00Z", focus_level: 5, block_number: 1, subject: "Data Structures" },
      { timestamp: "2026-03-14T10:50:00Z", focus_level: 4, block_number: 2, subject: "Calculus II" },
      { timestamp: "2026-03-14T11:10:00Z", focus_level: 3, block_number: 2, subject: "Calculus II" },
      { timestamp: "2026-03-14T11:25:00Z", focus_level: 2, block_number: 3, subject: "Intro Psychology" },
      { timestamp: "2026-03-14T11:40:00Z", focus_level: 2, block_number: 3, subject: "Intro Psychology" },
    ],
    recommendations: [
      { text: "Try 20-minute blocks for late-session subjects instead of 25 minutes.", category: "timing" },
      { text: "Your peak focus window is the first 45 minutes — start with your hardest material there.", category: "subject_order" },
      { text: "Consider a movement break between subjects to reset your attention.", category: "breaks" },
    ],
    encouragement:
      "Nice work! You showed up, tackled your hardest subject first, and responded to every check-in. That's what consistency looks like.",
  },
};

export const mockSessionReport = mockSessionEnd.report;

export const mockDashboardData = {
  total_sessions: 12,
  total_study_minutes: 1110,
  avg_focus: 3.4,
  focus_trend: [
    { session_id: "s1", date: "2026-03-08", duration_min: 60, average_focus: 3.8, subjects: ["Data Structures"], status: "completed" },
    { session_id: "s2", date: "2026-03-09", duration_min: 90, average_focus: 3.2, subjects: ["Calculus II", "Data Structures"], status: "completed" },
    { session_id: "s3", date: "2026-03-10", duration_min: 75, average_focus: 4.1, subjects: ["Data Structures"], status: "completed" },
    { session_id: "s4", date: "2026-03-11", duration_min: 45, average_focus: 3.5, subjects: ["Intro Psychology"], status: "completed" },
    { session_id: "s5", date: "2026-03-12", duration_min: 120, average_focus: 2.9, subjects: ["Calculus II", "Intro Psychology"], status: "completed" },
    { session_id: "s6", date: "2026-03-13", duration_min: 80, average_focus: 3.7, subjects: ["Data Structures", "Calculus II"], status: "completed" },
    { session_id: "s7", date: "2026-03-14", duration_min: 87, average_focus: 3.3, subjects: ["Data Structures", "Calculus II", "Intro Psychology"], status: "completed" },
  ],
  best_study_times: [
    { hour: 9, average_focus: 4.2, session_count: 5 },
    { hour: 10, average_focus: 4.0, session_count: 8 },
    { hour: 11, average_focus: 3.5, session_count: 6 },
    { hour: 14, average_focus: 3.3, session_count: 4 },
    { hour: 15, average_focus: 3.1, session_count: 3 },
  ],
  subject_averages: [
    { subject: "Data Structures", average_focus: 3.9, total_minutes: 432, session_count: 7 },
    { subject: "Calculus II", average_focus: 3.2, total_minutes: 390, session_count: 6 },
    { subject: "Intro Psychology", average_focus: 3.1, total_minutes: 288, session_count: 4 },
  ],
};

export const mockMedicationDB = {
  "adderall xr": {
    answer:
      "Adderall XR is an extended-release mixed amphetamine salt stimulant commonly prescribed for ADHD. It typically reaches peak effectiveness 2–3 hours after ingestion, with effects lasting 10–12 hours. For optimal study performance, schedule your hardest material during the peak window.",
    study_tips: [
      "Schedule your hardest subject 1–2 hours after your dose for peak effectiveness.",
      "Avoid caffeine for the first 2 hours — it can increase anxiety without improving focus.",
      "Stay hydrated. Stimulants can cause dehydration, which reduces cognitive performance.",
      "Eat a protein-rich meal before taking your dose to smooth absorption and reduce crashes.",
    ],
    sources_used: ["adhd_cognitive_science.md", "medication_reference.md"],
  },
  "adderall": {
    answer:
      "Adderall (immediate-release) is a mixed amphetamine salt stimulant for ADHD. It takes effect within 30–60 minutes and lasts 4–6 hours per dose. Because it's shorter-acting, you may need to time study sessions more precisely around each dose.",
    study_tips: [
      "Start studying within 30 minutes of taking your dose to maximize the focus window.",
      "Plan shorter, intense study blocks (60–90 min) that align with each dose's effective period.",
      "Keep a light snack nearby — stimulants can suppress appetite but your brain needs fuel.",
      "Avoid taking a dose too late in the day; it can interfere with sleep, which hurts next-day focus.",
    ],
    sources_used: ["adhd_cognitive_science.md", "medication_reference.md"],
  },
  "concerta": {
    answer:
      "Concerta (methylphenidate ER) uses an osmotic-release mechanism to provide steady focus over 10–12 hours. It ramps up gradually — expect a gentle onset over the first hour, with peak plasma levels around 6–8 hours. This makes it well-suited for long study days.",
    study_tips: [
      "Use the gradual onset period (first hour) for lighter review or organizing your study plan.",
      "Save your most demanding material for 2–6 hours after your dose when concentration is strongest.",
      "Don't skip breakfast — Concerta absorption is more consistent with food.",
      "Avoid acidic drinks (orange juice, soda) near dosing time as they can reduce absorption.",
    ],
    sources_used: ["adhd_cognitive_science.md", "methylphenidate_pharmacology.md"],
  },
  "vyvanse": {
    answer:
      "Vyvanse (lisdexamfetamine) is a prodrug stimulant — your body converts it to its active form after ingestion, producing a smooth onset over 1–2 hours with effects lasting 12–14 hours. Many students report it feels 'smoother' than other stimulants with fewer peaks and crashes.",
    study_tips: [
      "Take advantage of the long duration — Vyvanse supports both morning and afternoon study blocks.",
      "The smooth curve means no sharp peak; spread demanding tasks across your day rather than front-loading.",
      "Protein-rich meals help sustain effectiveness and prevent end-of-day crashes.",
      "Stay on top of hydration — dry mouth is common and dehydration worsens brain fog.",
    ],
    sources_used: ["adhd_cognitive_science.md", "lisdexamfetamine_studies.md"],
  },
  "ritalin": {
    answer:
      "Ritalin (methylphenidate IR) is a short-acting stimulant that kicks in within 20–30 minutes and lasts 3–4 hours. Its fast onset makes it useful for targeted study bursts, but you'll need to plan sessions around each dose's window.",
    study_tips: [
      "Start your study session right when you take Ritalin — it works fast.",
      "Plan focused 45–60 minute study blocks per dose, with breaks in between.",
      "If you take multiple doses daily, use each one strategically for different subjects.",
      "Track when it wears off so you can schedule lighter tasks (organizing notes, reviewing flashcards) during gaps.",
    ],
    sources_used: ["adhd_cognitive_science.md", "methylphenidate_pharmacology.md"],
  },
  "strattera": {
    answer:
      "Strattera (atomoxetine) is a non-stimulant ADHD medication that works on norepinephrine reuptake. Unlike stimulants, it builds up in your system over 4–6 weeks before reaching full effect. It provides 24-hour coverage without the peaks and crashes of stimulants.",
    study_tips: [
      "Be patient — full benefits may take 4–6 weeks. Don't judge effectiveness in the first few days.",
      "Since it works around the clock, you can study at any time without timing doses.",
      "Pair it with strong external structure (timers, to-do lists, accountability) while it builds up.",
      "Take it at the same time every day for consistent levels — missed doses can disrupt focus for 2–3 days.",
    ],
    sources_used: ["adhd_cognitive_science.md", "non_stimulant_treatments.md"],
  },
  "focalin": {
    answer:
      "Focalin (dexmethylphenidate) is the refined, more potent isomer of methylphenidate. The IR form lasts 4–5 hours; Focalin XR lasts 8–12 hours. It's often prescribed when regular methylphenidate causes too many side effects, as it requires a lower dose for the same effect.",
    study_tips: [
      "Focalin XR has a two-phase release — expect a boost at 1 hour and again at 4 hours.",
      "Schedule your hardest subject during the first peak (1–3 hours after dose).",
      "The second peak is great for review sessions or lighter practice problems.",
      "Keep a study log to identify your personal peak focus times on this medication.",
    ],
    sources_used: ["adhd_cognitive_science.md", "methylphenidate_pharmacology.md"],
  },
  "wellbutrin": {
    answer:
      "Wellbutrin (bupropion) is an antidepressant sometimes used off-label for ADHD. It acts on dopamine and norepinephrine, providing mild focus improvement and mood stabilization. Effects build over 2–4 weeks and provide steady all-day coverage.",
    study_tips: [
      "Effects are subtle and steady — don't expect the sharp focus boost of a stimulant.",
      "Leverage the mood-stabilizing effects by tackling frustrating or boring subjects when you feel most balanced.",
      "Maintain consistent sleep and exercise habits — Wellbutrin works best as part of a holistic routine.",
      "Combine with strong study techniques (Pomodoro, active recall) to compensate for the milder focus enhancement.",
    ],
    sources_used: ["adhd_cognitive_science.md", "non_stimulant_treatments.md"],
  },
  "guanfacine": {
    answer:
      "Guanfacine (Intuniv) is a non-stimulant alpha-2 agonist used for ADHD. It helps with emotional regulation, impulsivity, and working memory rather than pure attention. It takes 2–3 weeks to reach full effect and provides 24-hour coverage.",
    study_tips: [
      "Guanfacine excels at reducing impulsive task-switching — use it to stay on one subject longer.",
      "It may cause drowsiness initially; if so, take it at bedtime and study in the morning.",
      "Pair with organizational tools — it helps follow-through but not initiation.",
      "Stay consistent with doses; abrupt discontinuation can cause rebound anxiety and blood pressure spikes.",
    ],
    sources_used: ["adhd_cognitive_science.md", "non_stimulant_treatments.md"],
  },
  "modafinil": {
    answer:
      "Modafinil (Provigil) is a wakefulness-promoting agent sometimes used off-label for ADHD. It enhances alertness and executive function with a lower abuse potential than traditional stimulants. Effects last 12–15 hours with a gradual onset over 1–2 hours.",
    study_tips: [
      "Take it early in the morning — its long duration can disrupt sleep if taken after noon.",
      "It improves sustained attention more than short-burst focus; plan longer study sessions.",
      "Drink extra water — modafinil can cause headaches from dehydration.",
      "It pairs well with caffeine in small amounts, but avoid large doses of either.",
    ],
    sources_used: ["adhd_cognitive_science.md", "wakefulness_agents.md"],
  },
};

// Default fallback for the old export (backwards compat)
export const mockMedicationResponse = {
  ...mockMedicationDB["adderall xr"],
  disclaimer:
    "This information is for educational purposes only and is not medical advice. Always consult your healthcare provider about medications.",
};
