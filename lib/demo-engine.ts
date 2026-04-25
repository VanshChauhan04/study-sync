import type { ChatMessage, PlannerDay, PlannerInput, StudentProfile, StudyGroup } from "@/types/studysync";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function createGroupFromForm({
  capacity,
  description,
  institution,
  startTime,
  subject,
  title
}: {
  capacity: string;
  description: string;
  institution: string;
  startTime: string;
  subject: string;
  title: string;
}): StudyGroup {
  const normalizedTitle = title.trim() || `${subject} Study Circle`;
  const normalizedSubject = subject.trim() || "General Study";
  const safeCapacity = Math.min(12, Math.max(2, Number.parseInt(capacity, 10) || 5));
  const normalizedDescription =
    description.trim() ||
    `A focused peer session for ${normalizedSubject.toLowerCase()} practice, notes, and doubts.`;

  return {
    id: `${normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    title: normalizedTitle,
    subject: normalizedSubject,
    description: normalizedDescription,
    institution,
    sessionType: "Peer study",
    level: "Mixed",
    startTime: startTime.trim() || "Today, 8:30 PM",
    duration: "75 min",
    location: "Virtual room",
    language: "English + Hindi",
    members: 1,
    capacity: safeCapacity,
    compatibility: 91,
    scoreBreakdown: {
      subject: 33,
      schedule: 22,
      style: 13,
      difficulty: 13,
      institution: 10
    },
    matchReason:
      "You created this group, so StudySync pins it as a high-confidence fit and starts it with your profile preferences.",
    tags: ["Created by you", "Open seats", "Live soon"],
    growth: "New group",
    accent: "brick"
  };
}

export function generatePlanner(input: PlannerInput, profile: StudentProfile, groups: StudyGroup[]): PlannerDay[] {
  const topic = input.priorityTopic.trim() || profile.subjects[0] || "Core syllabus";
  const weakTopic = input.weakTopic.trim() || profile.weakAreas[0] || "revision backlog";
  const hours = Math.min(6, Math.max(1, Number.parseFloat(input.hoursPerDay) || 2));
  const groupSubjects = new Set(groups.map((group) => group.subject));
  const groupFit = groupSubjects.has(topic) || groupSubjects.has(profile.subjects[0]);
  const duration = hours >= 3 ? "1h 45m" : hours >= 2 ? "1h 20m" : "50m";

  return dayNames.slice(0, 5).map((day, index) => {
    if (index === 0) {
      return {
        day,
        focus: `${topic}: concept map and baseline quiz`,
        mode: "solo",
        duration,
        reason: "Starts with diagnosis so the group session does not waste time."
      };
    }

    if (index === 1) {
      return {
        day,
        focus: `${weakTopic}: peer problem-solving block`,
        mode: groupFit ? "group" : "review",
        duration,
        reason: groupFit
          ? "StudySync found active groups that can help with this weak area."
          : "No matching active group yet, so this becomes guided review."
      };
    }

    if (index === 2) {
      return {
        day,
        focus: `${topic}: timed practice set`,
        mode: "group",
        duration: hours >= 2 ? "1h 30m" : "1h",
        reason: "Timed peer drills create accountability and expose gaps quickly."
      };
    }

    if (index === 3) {
      return {
        day,
        focus: `${weakTopic}: mistake notebook and flash review`,
        mode: "review",
        duration: "45m",
        reason: "Spaced review locks in the mistakes from the group session."
      };
    }

    return {
      day,
      focus: `${topic}: mock mini-session before ${input.examDate || "exam day"}`,
      mode: "group",
      duration: hours >= 2 ? "1h 15m" : "55m",
      reason: "Final collaborative pass turns the plan into a presentable session summary."
    };
  });
}

export function createStudentMessage(content: string, sender = "Aarav"): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    role: "student",
    content,
    time: currentTimeLabel()
  };
}

export function createAiAnswer(question: string, group: StudyGroup, notes: string[]): ChatMessage {
  const normalizedQuestion = question.trim();
  const noteContext = notes.length > 0 ? ` Your current board has: ${notes.join(", ")}.` : "";
  const topic = group.subject.toLowerCase();

  return {
    id: `ai-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender: "StudySync AI",
    role: "ai",
    content: normalizedQuestion
      ? `For ${topic}, break the doubt into state, rule, and test case. ${answerStrategy(normalizedQuestion)}${noteContext}`
      : `Ask a specific doubt and I will answer it using ${group.title}'s subject, goal, and notes.`,
    time: currentTimeLabel()
  };
}

export function summarizeSession(messages: ChatMessage[], group: StudyGroup): string[] {
  const studentMessages = messages.filter((message) => message.role !== "ai");
  const lastStudentPoint = studentMessages.at(-1)?.content ?? "The group aligned on the next study target.";

  return [
    `${group.title} focused on ${group.subject} through ${group.sessionType.toLowerCase()}.`,
    `Main student doubt: ${lastStudentPoint}`,
    "Recommended next step: convert the hardest example into a reusable note template.",
    `Attendance signal: ${Math.min(group.members, group.capacity)}/${group.capacity} seats are active for this session.`,
    "XP awarded for joining, asking a doubt, contributing notes, and generating a summary."
  ];
}

function answerStrategy(question: string) {
  const lower = question.toLowerCase();

  if (lower.includes("knapsack") || lower.includes("dp") || lower.includes("dynamic")) {
    return "For DP, define dp[i][capacity] as the best answer using items from i onward, then compare skip vs take if capacity allows.";
  }

  if (lower.includes("graph") || lower.includes("bfs") || lower.includes("dfs")) {
    return "For graphs, first model nodes and edges, then choose BFS for shortest unweighted distance and DFS for exhaustive traversal/state search.";
  }

  if (lower.includes("os") || lower.includes("deadlock") || lower.includes("scheduling")) {
    return "For OS, name the resource/process state first, then apply the algorithm step-by-step instead of memorizing the final table.";
  }

  return "Write one tiny example, solve it manually, and only then generalize the formula or rule.";
}

function currentTimeLabel() {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());
}
