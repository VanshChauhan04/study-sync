import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedDbUser } from "@/lib/auth";

function pickAccent(seed: string) {
  const normalized = seed.toLowerCase();
  if (normalized.includes("data") || normalized.includes("dsa")) return "brick";
  if (normalized.includes("machine") || normalized.includes("ml")) return "aqua";
  if (normalized.includes("math") || normalized.includes("discrete")) return "stone";
  return "mist";
}

function buildScoreBreakdown() {
  return {
    subject: 33,
    schedule: 22,
    style: 13,
    difficulty: 13,
    institution: 10
  };
}

export async function GET() {
  const user = await getAuthedDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { memberships: true } },
      memberships: {
        where: { userId: user.id },
        select: { id: true }
      }
    }
  });

  const payload = groups.map((group) => {
    const members = group._count.memberships;
    const capacity = group.maxMembers;
    const compatibility = Math.max(70, Math.min(98, 80 + Math.round((members / Math.max(1, capacity)) * 18)));
    const accent = pickAccent(group.subject);

    return {
      id: group.id,
      title: group.name,
      subject: group.subject,
      description: `A focused peer session for ${group.subject.toLowerCase()} practice, notes, and doubts.`,
      institution: "StudySync",
      sessionType: "Peer study",
      level: "Mixed",
      startTime: "Today, 8:30 PM",
      duration: "75 min",
      location: "Virtual room",
      language: "English",
      members,
      capacity,
      compatibility,
      scoreBreakdown: buildScoreBreakdown(),
      matchReason: `High fit for ${group.subject}. Join to collaborate live and keep a shared pace.`,
      tags: [members < capacity ? "Open seats" : "Full", "Live room"],
      growth: members === 0 ? "New group" : `+${members} members`,
      accent,
      isMember: group.memberships.length > 0
    };
  });

  return NextResponse.json({
    groups: payload,
    total: payload.length
  });
}

export async function POST(req: Request) {
  const user = await getAuthedDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { name?: string; subject?: string; maxMembers?: number; title?: string; capacity?: number }
    | null;

  const name = (body?.name ?? body?.title)?.trim();
  const subject = body?.subject?.trim();
  const maxMembers = Number.isFinite(body?.maxMembers)
    ? Math.trunc(body?.maxMembers as number)
    : Number.isFinite(body?.capacity)
      ? Math.trunc(body?.capacity as number)
    : Number.NaN;

  if (!name || !subject || !Number.isFinite(maxMembers) || maxMembers < 2 || maxMembers > 50) {
    return NextResponse.json(
      { error: "Invalid body. Expected { name, subject, maxMembers(2-50) }." },
      { status: 400 }
    );
  }

  const created = await prisma.group.create({
    data: {
      name,
      subject,
      maxMembers,
      createdBy: user.id
    }
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      groupId: created.id
    }
  });

  const capacity = created.maxMembers;
  const members = 1;
  const compatibility = Math.max(70, Math.min(98, 80 + Math.round((members / Math.max(1, capacity)) * 18)));

  return NextResponse.json({
    group: {
      id: created.id,
      title: created.name,
      subject: created.subject,
      description: `A focused peer session for ${created.subject.toLowerCase()} practice, notes, and doubts.`,
      institution: "StudySync",
      sessionType: "Peer study",
      level: "Mixed",
      startTime: "Today, 8:30 PM",
      duration: "75 min",
      location: "Virtual room",
      language: "English",
      members,
      capacity,
      compatibility,
      scoreBreakdown: buildScoreBreakdown(),
      matchReason: `High fit for ${created.subject}. Join to collaborate live and keep a shared pace.`,
      tags: ["Created by you", "Open seats", "Live room"],
      growth: "New group",
      accent: pickAccent(created.subject),
      isMember: true
    }
  });
}
