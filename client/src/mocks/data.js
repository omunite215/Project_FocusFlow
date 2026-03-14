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

export const mockMedicationResponse = {
  answer:
    "Adderall XR is an extended-release mixed amphetamine salt stimulant commonly prescribed for ADHD. It typically reaches peak effectiveness 2-3 hours after ingestion, with effects lasting 10-12 hours. For optimal study performance, schedule your hardest material during the peak window.",
  study_tips: [
    "Schedule your hardest subject 1-2 hours after your dose for peak effectiveness.",
    "Avoid caffeine for the first 2 hours — it can increase anxiety without improving focus.",
    "Stay hydrated. Stimulants can cause dehydration, which reduces cognitive performance.",
  ],
  disclaimer:
    "This information is for educational purposes only and is not medical advice. Always consult your healthcare provider about medications.",
  sources_used: [
    "adhd_cognitive_science.md",
    "medication_reference.md",
  ],
};
