import type {
  ActiveSession,
  DashboardMetric,
  PlannerDay,
  StudentProfile,
  StudyGroup
} from "@/types/studysync";

export const studentProfile: StudentProfile = {
  name: "Aarav Mehta",
  institution: "NIET",
  year: "2nd year CSE",
  subjects: ["Data Structures", "Discrete Math", "Operating Systems"],
  learningStyle: "visual",
  preferredTimes: ["Morning", "Evening"],
  weakAreas: ["Dynamic programming", "Graph traversal"],
  studyGoal: "Crack end-sem algorithms with a consistent peer group."
};

export const studyGroups: StudyGroup[] = [
  {
    id: "dp-sprint",
    title: "Dynamic Programming Sprint",
    subject: "Data Structures",
    description:
      "A focused problem-solving pod for memoization, tabulation, and classic interview patterns.",
    institution: "NIET",
    sessionType: "Problem solving",
    level: "Intermediate",
    startTime: "Today, 7:00 PM",
    duration: "90 min",
    location: "Virtual whiteboard",
    language: "English + Hindi",
    members: 4,
    capacity: 6,
    compatibility: 94,
    scoreBreakdown: {
      subject: 34,
      schedule: 23,
      style: 14,
      difficulty: 14,
      institution: 9
    },
    matchReason:
      "You prefer visual explanations, share the same institution, and listed dynamic programming as a weak area.",
    tags: ["Recommended", "Trending", "Exam prep"],
    growth: "+3 joined in 45 min",
    accent: "brick"
  },
  {
    id: "os-lab",
    title: "Operating Systems Lab Circle",
    subject: "Operating Systems",
    description:
      "Trace scheduling algorithms, memory management, deadlocks, and lab viva questions together.",
    institution: "NIET",
    sessionType: "Revision",
    level: "Beginner friendly",
    startTime: "Tomorrow, 8:00 AM",
    duration: "60 min",
    location: "Library room B2",
    language: "English",
    members: 3,
    capacity: 5,
    compatibility: 88,
    scoreBreakdown: {
      subject: 32,
      schedule: 22,
      style: 12,
      difficulty: 13,
      institution: 9
    },
    matchReason:
      "Strong subject overlap, morning availability, and a small group size for accountability.",
    tags: ["Near campus", "Small group", "Viva"],
    growth: "+2 joined today",
    accent: "aqua"
  },
  {
    id: "graphs-guild",
    title: "Graphs Guild",
    subject: "Data Structures",
    description:
      "BFS, DFS, shortest paths, and graph modeling through visual walkthroughs and timed drills.",
    institution: "Open campus",
    sessionType: "Discussion",
    level: "Intermediate",
    startTime: "Friday, 6:30 PM",
    duration: "75 min",
    location: "Online",
    language: "English",
    members: 5,
    capacity: 8,
    compatibility: 82,
    scoreBreakdown: {
      subject: 33,
      schedule: 18,
      style: 14,
      difficulty: 13,
      institution: 4
    },
    matchReason:
      "Great fit for visual graph traversal practice, though the institution bonus is lower.",
    tags: ["Visual", "Practice set", "Open"],
    growth: "+5 this week",
    accent: "mist"
  },
  {
    id: "discrete-proof",
    title: "Discrete Math Proof Studio",
    subject: "Discrete Math",
    description:
      "A calm proof-writing group for induction, counting, recurrence relations, and graph theory.",
    institution: "NIET",
    sessionType: "Concept discussion",
    level: "Advanced",
    startTime: "Saturday, 10:00 AM",
    duration: "120 min",
    location: "Seminar hall 1",
    language: "English + Hindi",
    members: 2,
    capacity: 4,
    compatibility: 76,
    scoreBreakdown: {
      subject: 29,
      schedule: 20,
      style: 10,
      difficulty: 8,
      institution: 9
    },
    matchReason:
      "Same campus and schedule, but the group difficulty is slightly above your current comfort zone.",
    tags: ["Mentor led", "Proofs", "Campus"],
    growth: "+1 seat left soon",
    accent: "stone"
  }
];

export const plannerDays: PlannerDay[] = [
  {
    day: "Mon",
    focus: "DP patterns: knapsack and LIS",
    mode: "group",
    duration: "1h 30m",
    reason: "High difficulty topic with strong peer fit."
  },
  {
    day: "Tue",
    focus: "OS scheduling summary notes",
    mode: "solo",
    duration: "50m",
    reason: "Good for quiet revision before discussion."
  },
  {
    day: "Wed",
    focus: "Graph traversal drills",
    mode: "group",
    duration: "1h 15m",
    reason: "Visual walkthroughs improve retention."
  },
  {
    day: "Thu",
    focus: "Discrete math recurrence proofs",
    mode: "review",
    duration: "45m",
    reason: "Short spaced review keeps proof steps fresh."
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "StudyScore",
    value: "812",
    change: "+46 this week"
  },
  {
    label: "Study streak",
    value: "11 days",
    change: "Best: 18 days"
  },
  {
    label: "Sessions joined",
    value: "24",
    change: "7 completed"
  },
  {
    label: "Avg rating",
    value: "4.7/5",
    change: "Top 12% in DSA"
  }
];

export const activeSession: ActiveSession = {
  goal: "Solve 6 dynamic programming problems and summarize reusable states.",
  groupTitle: "Dynamic Programming Sprint",
  subject: "Data Structures",
  attendees: ["Aarav", "Nisha", "Kabir", "Meera", "Dev"],
  messages: [
    {
      id: "m1",
      sender: "Nisha",
      role: "student",
      content: "Can we start with top-down recursion before tabulation?",
      time: "7:04 PM"
    },
    {
      id: "m2",
      sender: "StudySync AI",
      role: "ai",
      content:
        "Good plan. Start by naming the state, then define the transition before optimizing memory.",
      time: "7:05 PM"
    },
    {
      id: "m3",
      sender: "Kabir",
      role: "mentor",
      content: "I added the recurrence template to the shared notes.",
      time: "7:07 PM"
    }
  ],
  whiteboardNotes: ["state: dp[i][w]", "choice: take / skip", "base: i == n or w == 0"]
};
