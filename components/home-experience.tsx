"use client";

import { useDeferredValue, useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Icon } from "@/components/icons";
import {
  createAiAnswer,
  createGroupFromForm,
  createStudentMessage,
  generatePlanner,
  summarizeSession
} from "@/lib/demo-engine";
import type {
  ActiveSession,
  ChatMessage,
  DashboardMetric,
  DemoState,
  PlannerDay,
  PlannerInput,
  StudentProfile,
  StudyGroup
} from "@/types/studysync";

type HomeExperienceProps = {
  activeSession: ActiveSession;
  dashboardMetrics: DashboardMetric[];
  groups: StudyGroup[];
  plannerDays: PlannerDay[];
  profile: StudentProfile;
};

const navItems = [
  { href: "#discover", label: "Discover" },
  { href: "#match", label: "Match AI" },
  { href: "#room", label: "Live Room" },
  { href: "#planner", label: "Planner" },
  { href: "#progress", label: "Progress" }
];

const storageKey = "studysync-demo-state-v1";

const defaultPlannerInput: PlannerInput = {
  examDate: "2026-05-02",
  hoursPerDay: "2",
  priorityTopic: "Data Structures",
  weakTopic: "Dynamic programming"
};

export function HomeExperience({
  activeSession,
  dashboardMetrics,
  groups,
  plannerDays,
  profile
}: HomeExperienceProps) {
  const [demoGroups, setDemoGroups] = useState(groups);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? "");
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [currentPlan, setCurrentPlan] = useState(plannerDays);
  const [plannerInput, setPlannerInput] = useState(defaultPlannerInput);
  const [aiQuestion, setAiQuestion] = useState("Explain 0/1 knapsack state transition");
  const [aiAnswer, setAiAnswer] = useState(
    "Ask StudySync AI inside the room and it will answer using the group's subject, goal, and notes."
  );
  const [plannerGenerated, setPlannerGenerated] = useState(false);
  const [messagesByGroup, setMessagesByGroup] = useState<Record<string, ChatMessage[]>>({});
  const [summariesByGroup, setSummariesByGroup] = useState<Record<string, string[]>>({});
  const [chatDraft, setChatDraft] = useState("");
  const [toast, setToast] = useState("Demo state saves locally, so refresh will keep joined groups and plans.");
  const [hasLoadedState, setHasLoadedState] = useState(false);
  const [groupDraft, setGroupDraft] = useState({
    capacity: "6",
    description: "Solve recent exam questions and build a shared revision note.",
    startTime: "Today, 8:30 PM",
    subject: "Data Structures",
    title: "End-Sem DSA Rescue Room"
  });

  const deferredSearch = useDeferredValue(search);
  const subjects = ["All", ...Array.from(new Set(demoGroups.map((group) => group.subject)))];
  const selectedGroup = demoGroups.find((group) => group.id === selectedGroupId) ?? demoGroups[0];
  const groupMessages = messagesByGroup[selectedGroup.id] ?? activeSession.messages;
  const sessionSummary = summariesByGroup[selectedGroup.id] ?? [];
  const joinedCount = joinedGroups.length;
  const studentMessageCount = Object.values(messagesByGroup)
    .flat()
    .filter((message) => message.role === "student").length;
  const summaryCount = Object.values(summariesByGroup).reduce(
    (total, summary) => total + (summary.length > 0 ? 1 : 0),
    0
  );
  const liveMetrics = [
    {
      label: "StudyScore",
      value: String(812 + joinedCount * 22 + studentMessageCount * 6 + summaryCount * 18),
      change: `${joinedCount} joined group${joinedCount === 1 ? "" : "s"}`
    },
    {
      label: "Study streak",
      value: dashboardMetrics[1]?.value ?? "11 days",
      change: plannerGenerated ? "Next plan generated" : "Generate today's plan"
    },
    {
      label: "Sessions joined",
      value: String(24 + joinedCount),
      change: `${studentMessageCount} demo chat contribution${studentMessageCount === 1 ? "" : "s"}`
    },
    {
      label: "Avg rating",
      value: dashboardMetrics[3]?.value ?? "4.7/5",
      change: summaryCount > 0 ? "Session summary ready" : "End a session to update"
    }
  ];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredGroups = demoGroups.filter((group) => {
    const matchesSubject = selectedSubject === "All" || group.subject === selectedSubject;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [group.title, group.subject, group.description, group.sessionType]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);

    return matchesSubject && matchesSearch;
  });

  useEffect(() => {
    window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (!saved) {
          setHasLoadedState(true);
          return;
        }

        const parsed = JSON.parse(saved) as Partial<DemoState>;
        setDemoGroups(parsed.groups?.length ? parsed.groups : groups);
        setJoinedGroups(parsed.joinedGroupIds ?? []);
        setCurrentPlan(parsed.plannerDays?.length ? parsed.plannerDays : plannerDays);
        setPlannerInput(parsed.plannerInput ?? defaultPlannerInput);
        setMessagesByGroup(parsed.messagesByGroup ?? {});
        setSummariesByGroup(parsed.summariesByGroup ?? {});
        setPlannerGenerated(Boolean(parsed.plannerDays?.length));
      } catch {
        setToast("Saved demo state could not be loaded, so StudySync started fresh.");
      } finally {
        setHasLoadedState(true);
      }
    }, 0);
  }, [groups, plannerDays]);

  useEffect(() => {
    if (!hasLoadedState) {
      return;
    }

    const state: DemoState = {
      groups: demoGroups,
      joinedGroupIds: joinedGroups,
      plannerDays: currentPlan,
      plannerInput,
      messagesByGroup,
      summariesByGroup
    };

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [
    currentPlan,
    demoGroups,
    hasLoadedState,
    joinedGroups,
    messagesByGroup,
    plannerInput,
    summariesByGroup
  ]);

  function handleJoin(groupId: string) {
    const group = demoGroups.find((item) => item.id === groupId);
    if (!group) {
      return;
    }

    const isJoined = joinedGroups.includes(groupId);
    if (!isJoined && group.members >= group.capacity) {
      setToast(`${group.title} is full. Try another group or create your own.`);
      return;
    }

    setDemoGroups((current) =>
      current.map((item) => {
        if (item.id !== groupId) {
          return item;
        }

        return {
          ...item,
          members: isJoined ? Math.max(0, item.members - 1) : Math.min(item.capacity, item.members + 1)
        };
      })
    );
    setJoinedGroups((current) => (isJoined ? current.filter((id) => id !== groupId) : [...current, groupId]));
    setSelectedGroupId(groupId);
    setToast(isJoined ? `You left ${group.title}.` : `Joined ${group.title}. Seat count and dashboard updated.`);
  }

  function handleAskAi() {
    const question = aiQuestion.trim();
    if (!question) {
      setAiAnswer("Type a doubt first so StudySync AI can anchor the answer to this session.");
      return;
    }

    const answer = createAiAnswer(question, selectedGroup, activeSession.whiteboardNotes);
    setMessagesByGroup((current) => ({
      ...current,
      [selectedGroup.id]: [...(current[selectedGroup.id] ?? activeSession.messages), answer]
    }));
    setAiAnswer(answer.content);
    setToast("StudySync AI added an answer to the live room.");
  }

  function createStudyGroup() {
    const createdGroup = createGroupFromForm({
      ...groupDraft,
      institution: profile.institution
    });

    setDemoGroups((current) => [createdGroup, ...current]);
    setJoinedGroups((current) => Array.from(new Set([createdGroup.id, ...current])));
    setSelectedSubject("All");
    setSelectedGroupId(createdGroup.id);
    setMessagesByGroup((current) => ({
      ...current,
      [createdGroup.id]: [
        {
          id: `welcome-${createdGroup.id}`,
          sender: "StudySync AI",
          role: "ai",
          content: `I created a live room for ${createdGroup.title}. Add a first message or generate a session summary after discussion.`,
          time: "Now"
        }
      ]
    }));
    setToast(`${createdGroup.title} is live and joined as your group.`);
    setGroupDraft((current) => ({
      ...current,
      title: "",
      description: ""
    }));
  }

  function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createStudyGroup();
  }

  function handleGeneratePlanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const relevantGroups = demoGroups.filter(
      (group) => joinedGroups.includes(group.id) || group.subject === plannerInput.priorityTopic
    );
    const generated = generatePlanner(
      plannerInput,
      profile,
      relevantGroups.length > 0 ? relevantGroups : demoGroups
    );

    setCurrentPlan(generated);
    setPlannerGenerated(true);
    setToast("Generated a new weekly plan from your exam date, hours, weak topic, and joined groups.");
  }

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = chatDraft.trim();
    if (!message) {
      return;
    }

    setMessagesByGroup((current) => ({
      ...current,
      [selectedGroup.id]: [
        ...(current[selectedGroup.id] ?? activeSession.messages),
        createStudentMessage(message, profile.name.split(" ")[0] || profile.name)
      ]
    }));
    setChatDraft("");
    setToast("Message added to the live room and saved locally.");
  }

  function handleGenerateSummary() {
    const summary = summarizeSession(groupMessages, selectedGroup);

    setSummariesByGroup((current) => ({
      ...current,
      [selectedGroup.id]: summary
    }));
    setToast("Generated a session summary from the current room messages.");
  }

  function handleResetDemo() {
    window.localStorage.removeItem(storageKey);
    setDemoGroups(groups);
    setJoinedGroups([]);
    setCurrentPlan(plannerDays);
    setPlannerInput(defaultPlannerInput);
    setMessagesByGroup({});
    setSummariesByGroup({});
    setPlannerGenerated(false);
    setSelectedGroupId(groups[0]?.id ?? "");
    setToast("Demo state reset. You can now rehearse the flow from a clean slate.");
  }

  return (
    <main className="app-shell">
      <Navigation />
      <div className="status-toast" role="status">
        <span>{toast}</span>
        <button onClick={handleResetDemo} type="button">
          Reset demo
        </button>
      </div>

      <section className="hero section-grid" id="discover">
        <div className="hero-copy">
          <p className="eyebrow">
            <Icon name="spark" size={16} />
            AI-powered study group finder
          </p>
          <h1>Find the study group that actually fits how you learn.</h1>
          <p className="hero-lede">
            StudySync matches students by subject, schedule, learning style, difficulty, and campus
            context, then gives every group a live room for notes, chat, goals, and AI help.
          </p>

          <div className="hero-actions" aria-label="Primary actions">
            <a className="button primary" href="#groups">
              Discover groups
              <Icon name="chevron" size={18} />
            </a>
            <a className="button secondary" href="#planner">
              Build study plan
            </a>
          </div>

          <div className="quick-stats" aria-label="StudySync demo metrics">
            <Stat value="< 3 min" label="group formation" />
            <Stat value="94%" label="top match score" />
            <Stat value="5+" label="live collaborators" />
          </div>
        </div>

        <HeroIllustration selectedGroup={selectedGroup} />
      </section>

      <section className="section-block" id="groups">
        <SectionHeader
          eyebrow="Discovery"
          icon="compass"
          title="Live group openings"
          description="Search by subject or intent, then let compatibility scores explain why a group is worth joining."
        />

        <div className="discovery-layout">
          <aside className="profile-card glass-card" aria-label="Academic profile">
            <div className="profile-topline">
              <span className="avatar" aria-hidden="true">
                AM
              </span>
              <div>
                <h2>{profile.name}</h2>
                <p>
                  {profile.year}, {profile.institution}
                </p>
              </div>
            </div>
            <p className="profile-goal">{profile.studyGoal}</p>
            <div className="chip-cloud">
              {profile.subjects.map((subject) => (
                <span className="chip" key={subject}>
                  {subject}
                </span>
              ))}
            </div>
            <div className="profile-insight">
              <Icon name="brain" />
              <span>
                Learns best through {profile.learningStyle} examples and peer walkthroughs.
              </span>
            </div>

            <form className="create-card" onSubmit={handleCreateGroup}>
              <div>
                <span className="mini-label">Create usable group</span>
                <h3>Open a study room</h3>
              </div>
              <label>
                <span>Title</span>
                <input
                  onChange={(event) =>
                    setGroupDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="End-Sem DSA Rescue Room"
                  value={groupDraft.title}
                />
              </label>
              <label>
                <span>Subject</span>
                <select
                  onChange={(event) =>
                    setGroupDraft((current) => ({ ...current, subject: event.target.value }))
                  }
                  value={groupDraft.subject}
                >
                  {[...profile.subjects, "Machine Learning", "Database Systems"].map((subject) => (
                    <option key={subject}>{subject}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Time</span>
                <input
                  onChange={(event) =>
                    setGroupDraft((current) => ({ ...current, startTime: event.target.value }))
                  }
                  value={groupDraft.startTime}
                />
              </label>
              <label>
                <span>Seats</span>
                <input
                  min="2"
                  max="12"
                  onChange={(event) =>
                    setGroupDraft((current) => ({ ...current, capacity: event.target.value }))
                  }
                  type="number"
                  value={groupDraft.capacity}
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  onChange={(event) =>
                    setGroupDraft((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={3}
                  value={groupDraft.description}
                />
              </label>
              <button className="button primary compact" onClick={createStudyGroup} type="button">
                Create and join
              </button>
            </form>
          </aside>

          <div className="group-console">
            <div className="search-row">
              <label className="search-box">
                <Icon name="search" />
                <span className="sr-only">Search groups</span>
                <input
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search DSA, OS, proofs..."
                  value={search}
                />
              </label>
              <div className="subject-pills" aria-label="Subject filters">
                {subjects.map((subject) => (
                  <button
                    className={subject === selectedSubject ? "pill active" : "pill"}
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    type="button"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="group-grid">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                <GroupCard
                  group={group}
                  isJoined={joinedGroups.includes(group.id)}
                  isSelected={selectedGroup.id === group.id}
                  key={group.id}
                  onJoin={() => handleJoin(group.id)}
                  onSelect={() => setSelectedGroupId(group.id)}
                />
                ))
              ) : (
                <div className="empty-card">
                  <Icon name="search" />
                  <h3>No groups found</h3>
                  <p>Create a group from the profile panel and it will appear here instantly.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-grid match-grid" id="match">
        <div className="glass-card match-card">
          <SectionHeader
            eyebrow="Match AI"
            icon="target"
            title={`${selectedGroup.compatibility}% compatible`}
            description={selectedGroup.matchReason}
          />

          <div className="score-bars" aria-label="Compatibility score breakdown">
            <ScoreBar label="Subject relevance" value={selectedGroup.scoreBreakdown.subject} max={35} />
            <ScoreBar label="Schedule overlap" value={selectedGroup.scoreBreakdown.schedule} max={25} />
            <ScoreBar label="Learning style" value={selectedGroup.scoreBreakdown.style} max={15} />
            <ScoreBar label="Difficulty match" value={selectedGroup.scoreBreakdown.difficulty} max={15} />
            <ScoreBar label="Institution bonus" value={selectedGroup.scoreBreakdown.institution} max={10} />
          </div>
        </div>

        <div className="glass-card session-card" id="room">
          <SectionHeader
            eyebrow="Live Room"
            icon="chat"
            title={selectedGroup.title}
            description={`Goal: ${activeSession.goal}`}
          />

          <div className="room-shell">
            <div className="chat-panel">
              {groupMessages.map((message) => (
                <article className={`message ${message.role}`} key={message.id}>
                  <div>
                    <strong>{message.sender}</strong>
                    <span>{message.time}</span>
                  </div>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>

            <div className="whiteboard-panel" aria-label="Whiteboard preview">
              {activeSession.whiteboardNotes.map((note, index) => (
                <span key={note} style={{ "--note-index": index } as CSSProperties}>
                  {note}
                </span>
              ))}
            </div>
          </div>

          <form className="chat-composer" onSubmit={handleSendMessage}>
            <label>
              <span className="sr-only">Message the group</span>
              <input
                onChange={(event) => setChatDraft(event.target.value)}
                placeholder={`Message ${selectedGroup.title}...`}
                value={chatDraft}
              />
            </label>
            <button className="button secondary compact" type="submit">
              Send message
            </button>
          </form>

          <div className="ai-console">
            <label>
              <span>Ask in-group AI</span>
              <input
                onChange={(event) => setAiQuestion(event.target.value)}
                value={aiQuestion}
              />
            </label>
            <button className="button primary compact" onClick={handleAskAi} type="button">
              Ask AI
            </button>
          </div>
          <p className="ai-answer">{aiAnswer}</p>

          <div className="room-actions">
            <button className="button secondary compact" onClick={handleGenerateSummary} type="button">
              Generate session summary
            </button>
            <span>{joinedGroups.includes(selectedGroup.id) ? "You are in this room" : "Join to claim a seat"}</span>
          </div>

          {sessionSummary.length > 0 ? (
            <div className="summary-card">
              <h3>AI session summary</h3>
              <ul>
                {sessionSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="section-grid planner-progress" id="planner">
        <div className="glass-card planner-card">
          <SectionHeader
            eyebrow="Planner"
            icon="calendar"
            title="Personal weekly plan"
            description="Generate a real demo plan from exam date, available hours, weak topic, and your joined groups."
          />

          <form className="planner-form" onSubmit={handleGeneratePlanner}>
            <label>
              <span>Exam date</span>
              <input
                onChange={(event) =>
                  setPlannerInput((current) => ({ ...current, examDate: event.target.value }))
                }
                type="date"
                value={plannerInput.examDate}
              />
            </label>
            <label>
              <span>Hours/day</span>
              <input
                min="1"
                max="6"
                onChange={(event) =>
                  setPlannerInput((current) => ({ ...current, hoursPerDay: event.target.value }))
                }
                type="number"
                value={plannerInput.hoursPerDay}
              />
            </label>
            <label>
              <span>Priority subject</span>
              <select
                onChange={(event) =>
                  setPlannerInput((current) => ({ ...current, priorityTopic: event.target.value }))
                }
                value={plannerInput.priorityTopic}
              >
                {subjects
                  .filter((subject) => subject !== "All")
                  .map((subject) => (
                    <option key={subject}>{subject}</option>
                  ))}
              </select>
            </label>
            <label>
              <span>Weak topic</span>
              <input
                onChange={(event) =>
                  setPlannerInput((current) => ({ ...current, weakTopic: event.target.value }))
                }
                value={plannerInput.weakTopic}
              />
            </label>
            <button className={plannerGenerated ? "button success" : "button secondary"} type="submit">
              <Icon name={plannerGenerated ? "check" : "spark"} size={18} />
              {plannerGenerated ? "Regenerate plan" : "Generate next plan"}
            </button>
          </form>

          <div className="planner-list">
            {currentPlan.map((day) => (
              <article className={`planner-item ${day.mode}`} key={day.day}>
                <div>
                  <strong>{day.day}</strong>
                  <span>{day.mode}</span>
                </div>
                <h3>{day.focus}</h3>
                <p>{day.reason}</p>
                <small>{day.duration}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-card progress-card" id="progress">
          <SectionHeader
            eyebrow="Progress"
            icon="bolt"
            title="StudyScore dashboard"
            description="Gamified progress keeps groups accountable without making the product feel heavy."
          />

          <div className="metric-grid">
            {liveMetrics.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.change}</small>
              </article>
            ))}
          </div>

          <div className="badge-row" aria-label="Earned badges">
            <span>Early Bird</span>
            <span>Subject Expert</span>
            <span>Consistent</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function Navigation() {
  return (
    <header className="topbar">
      <a className="brand" href="#discover" aria-label="StudySync home">
        <span className="brand-mark">S</span>
        <span>StudySync</span>
      </a>
      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <a href={item.href} key={item.label}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="button nav-button" href="#groups">
        Find a group
      </a>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SectionHeader({
  description,
  eyebrow,
  icon,
  title
}: {
  description: string;
  eyebrow: string;
  icon: "bolt" | "brain" | "calendar" | "chat" | "compass" | "target";
  title: string;
}) {
  return (
    <div className="section-header">
      <p className="eyebrow">
        <Icon name={icon} size={16} />
        {eyebrow}
      </p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function HeroIllustration({ selectedGroup }: { selectedGroup: StudyGroup }) {
  return (
    <div className="hero-visual" aria-label="StudySync matching illustration">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="match-node main-node">
        <Icon name="brain" size={26} />
        <strong>{selectedGroup.compatibility}%</strong>
        <span>AI match</span>
      </div>
      <div className="floating-card card-one">
        <Icon name="users" />
        <span>{selectedGroup.members}/{selectedGroup.capacity} seats</span>
      </div>
      <div className="floating-card card-two">
        <Icon name="clock" />
        <span>{selectedGroup.startTime}</span>
      </div>
      <div className="floating-card card-three">
        <Icon name="map" />
        <span>{selectedGroup.location}</span>
      </div>
    </div>
  );
}

function GroupCard({
  group,
  isJoined,
  isSelected,
  onJoin,
  onSelect
}: {
  group: StudyGroup;
  isJoined: boolean;
  isSelected: boolean;
  onJoin: () => void;
  onSelect: () => void;
}) {
  const seats = Math.min(group.capacity, group.members + (isJoined ? 1 : 0));

  return (
    <article className={`group-card ${group.accent} ${isSelected ? "selected" : ""}`}>
      <div className="group-card-head">
        <span>{group.subject}</span>
        <strong>{group.compatibility}%</strong>
      </div>
      <h3>{group.title}</h3>
      <p>{group.description}</p>
      <div className="meta-row">
        <span>
          <Icon name="users" size={16} />
          {seats}/{group.capacity}
        </span>
        <span>
          <Icon name="clock" size={16} />
          {group.startTime}
        </span>
      </div>
      <div className="chip-cloud">
        {group.tags.map((tag) => (
          <span className="chip" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="group-card-footer">
        <span>{group.growth}</span>
        <div className="group-actions">
          <button className="view-button" onClick={onSelect} type="button">
            {isSelected ? "Viewing" : "View match"}
          </button>
          <button className={isJoined ? "join-button joined" : "join-button"} onClick={onJoin} type="button">
            {isJoined ? "Joined" : "Join"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ScoreBar({ label, max, value }: { label: string; max: number; value: number }) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="score-row">
      <div>
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <div className="score-track" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
