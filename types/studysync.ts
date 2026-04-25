export type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic";

export type StudentProfile = {
  name: string;
  institution: string;
  year: string;
  subjects: string[];
  learningStyle: LearningStyle;
  preferredTimes: string[];
  weakAreas: string[];
  studyGoal: string;
};

export type ScoreBreakdown = {
  subject: number;
  schedule: number;
  style: number;
  difficulty: number;
  institution: number;
};

export type StudyGroup = {
  id: string;
  title: string;
  subject: string;
  description: string;
  institution: string;
  sessionType: string;
  level: string;
  startTime: string;
  duration: string;
  location: string;
  language: string;
  members: number;
  capacity: number;
  compatibility: number;
  scoreBreakdown: ScoreBreakdown;
  matchReason: string;
  tags: string[];
  growth: string;
  accent: "brick" | "aqua" | "stone" | "mist";
};

export type PlannerDay = {
  day: string;
  focus: string;
  mode: "solo" | "group" | "review";
  duration: string;
  reason: string;
};

export type PlannerInput = {
  examDate: string;
  hoursPerDay: string;
  priorityTopic: string;
  weakTopic: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
};

export type ChatMessage = {
  id: string;
  sender: string;
  role: "student" | "ai" | "mentor";
  content: string;
  time: string;
};

export type ActiveSession = {
  goal: string;
  groupTitle: string;
  subject: string;
  attendees: string[];
  messages: ChatMessage[];
  whiteboardNotes: string[];
};

export type DemoState = {
  groups: StudyGroup[];
  joinedGroupIds: string[];
  plannerDays: PlannerDay[];
  plannerInput: PlannerInput;
  messagesByGroup: Record<string, ChatMessage[]>;
  summariesByGroup: Record<string, string[]>;
};
