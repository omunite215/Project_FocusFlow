// FocusFlow mock data — mirrors exact API response schemas.
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
};

export const mockSessionPlan = {
  session_id: "sess-1",
  plan: {
    total_minutes: 90,
    blocks: [
      {
        subject: "Data Structures",
        duration_minutes: 30,
        method: "Active Recall",
        order: 1,
      },
      {
        subject: "Calculus II",
        duration_minutes: 35,
        method: "Practice Problems",
        order: 2,
      },
      {
        subject: "Intro Psychology",
        duration_minutes: 25,
        method: "Summarization",
        order: 3,
      },
    ],
    reasoning:
      "Starting with Data Structures — your closest deadline and hardest subject — while your medication is at peak effectiveness. Calculus follows during your strong focus window. Ending with Psychology as a lighter cooldown.",
  },
};

export const mockCheckInResponses = [
  { adaptation_needed: false, suggestion: null },
  { adaptation_needed: false, suggestion: null },
  { adaptation_needed: false, suggestion: null },
  { adaptation_needed: false, suggestion: null },
  {
    adaptation_needed: true,
    suggestion: {
      type: "switch_method",
      message:
        "Your focus has been dipping. Let's try switching things up — a different approach can re-engage your attention.",
      suggested_method: "Mind Mapping",
      reasoning:
        "Research shows switching study modalities can re-engage attention when focus declines. Mind mapping uses spatial reasoning, a different cognitive pathway than practice problems.",
    },
  },
  {
    adaptation_needed: true,
    suggestion: {
      type: "take_break",
      message:
        "You've been working hard. A 5-minute movement break can reset your focus better than pushing through.",
      suggested_method: "Movement Break",
      reasoning:
        "After sustained low focus, brief physical activity increases dopamine and norepinephrine, improving attention for the next block.",
    },
  },
];

export const mockSessionReport = {
  session_id: "sess-1",
  duration_minutes: 87,
  blocks_completed: 3,
  average_focus: 3.3,
  peak_focus: 5,
  total_checkins: 6,
  focus_curve: [
    { index: 1, focus: 4, subject: "Data Structures", time: "10:15 AM" },
    { index: 2, focus: 5, subject: "Data Structures", time: "10:30 AM" },
    { index: 3, focus: 4, subject: "Calculus II", time: "10:50 AM" },
    { index: 4, focus: 3, subject: "Calculus II", time: "11:10 AM" },
    { index: 5, focus: 2, subject: "Intro Psychology", time: "11:25 AM" },
    { index: 6, focus: 2, subject: "Intro Psychology", time: "11:40 AM" },
  ],
  insights: [
    "You maintained strong focus during Data Structures (avg 4.5) — great work on your hardest subject!",
    "Focus peaked at check-in #2, about 30 minutes after your medication dose.",
    "Focus declined during the final subject. Shorter blocks may help next time.",
  ],
  suggestions: [
    "Try 20-minute blocks for late-session subjects instead of 25 minutes.",
    "Your peak focus window appears to be the first 45 minutes — start with your hardest material there.",
    "Consider a movement break between subjects to reset your attention.",
  ],
  achievements: [
    "Completed 87 of 90 planned minutes",
    "Responded to all 6 check-ins",
    "Tackled your hardest subject first",
  ],
};

export const mockDashboardData = {
  total_sessions: 12,
  total_study_hours: 18.5,
  avg_focus: 3.4,
  current_streak: 3,
  weekly_focus: [
    { day: "Mon", avg: 3.8 },
    { day: "Tue", avg: 3.2 },
    { day: "Wed", avg: 4.1 },
    { day: "Thu", avg: 3.5 },
    { day: "Fri", avg: 2.9 },
    { day: "Sat", avg: 3.7 },
    { day: "Sun", avg: 3.6 },
  ],
  subject_breakdown: [
    { subject: "Data Structures", hours: 7.2, avg_focus: 3.9 },
    { subject: "Calculus II", hours: 6.5, avg_focus: 3.2 },
    { subject: "Intro Psychology", hours: 4.8, avg_focus: 3.1 },
  ],
  study_heatmap: [
    { day: "Mon", slot: "Morning", intensity: 0.8 },
    { day: "Mon", slot: "Afternoon", intensity: 0.5 },
    { day: "Mon", slot: "Evening", intensity: 0.2 },
    { day: "Tue", slot: "Morning", intensity: 0.9 },
    { day: "Tue", slot: "Afternoon", intensity: 0.6 },
    { day: "Tue", slot: "Evening", intensity: 0.1 },
    { day: "Wed", slot: "Morning", intensity: 0.7 },
    { day: "Wed", slot: "Afternoon", intensity: 0.8 },
    { day: "Wed", slot: "Evening", intensity: 0.3 },
    { day: "Thu", slot: "Morning", intensity: 0.6 },
    { day: "Thu", slot: "Afternoon", intensity: 0.4 },
    { day: "Thu", slot: "Evening", intensity: 0.5 },
    { day: "Fri", slot: "Morning", intensity: 0.5 },
    { day: "Fri", slot: "Afternoon", intensity: 0.3 },
    { day: "Fri", slot: "Evening", intensity: 0.1 },
    { day: "Sat", slot: "Morning", intensity: 0.4 },
    { day: "Sat", slot: "Afternoon", intensity: 0.7 },
    { day: "Sat", slot: "Evening", intensity: 0.2 },
    { day: "Sun", slot: "Morning", intensity: 0.3 },
    { day: "Sun", slot: "Afternoon", intensity: 0.5 },
    { day: "Sun", slot: "Evening", intensity: 0.4 },
  ],
  medication_correlation: {
    with_medication: { avg_focus: 4.1, sessions: 8 },
    without_medication: { avg_focus: 2.9, sessions: 4 },
  },
};

export const mockMedicationInfo = [
  {
    name: "Adderall XR",
    type: "Stimulant (mixed amphetamine salts)",
    onset: "30-60 minutes",
    peak: "2-3 hours after dose",
    duration: "10-12 hours",
    study_tips: [
      "Schedule your hardest subject 1-2 hours after your dose for peak effectiveness.",
      "Avoid caffeine for the first 2 hours after taking — it can increase anxiety without improving focus.",
      "Stay hydrated. Stimulants can cause dehydration, which reduces cognitive performance.",
    ],
    interactions: [
      "Vitamin C and citrus can reduce absorption — take medication on an empty stomach or with non-acidic food.",
      "Caffeine amplifies stimulant effects. If you drink coffee, reduce your usual amount.",
    ],
    source: "ADHD Research & Clinical Guidelines (RAG)",
  },
  {
    name: "Concerta",
    type: "Stimulant (methylphenidate ER)",
    onset: "30-60 minutes",
    peak: "6-8 hours (OROS release system)",
    duration: "10-12 hours",
    study_tips: [
      "Concerta's unique release system means focus stays more consistent throughout the day.",
      "Best taken in the morning — the extended release covers most study hours.",
      "If you notice a dip around hour 8, plan lighter review material for that window.",
    ],
    interactions: [
      "Avoid grapefruit juice — it can alter medication metabolism.",
      "Alcohol reduces effectiveness and increases side effects.",
    ],
    source: "ADHD Research & Clinical Guidelines (RAG)",
  },
  {
    name: "Vyvanse",
    type: "Stimulant (lisdexamfetamine)",
    onset: "1-2 hours (prodrug conversion)",
    peak: "3-4 hours after dose",
    duration: "12-14 hours",
    study_tips: [
      "Vyvanse has the smoothest onset — great for morning study sessions without the initial rush.",
      "Plan your most challenging material for 2-4 hours post-dose.",
      "The long duration means evening study is still productive, but watch for sleep impact.",
    ],
    interactions: [
      "High-protein meals may slightly delay onset.",
      "Same vitamin C / citrus caution as other stimulants.",
    ],
    source: "ADHD Research & Clinical Guidelines (RAG)",
  },
];
