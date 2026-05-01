import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedDbUser } from "@/lib/auth";

async function requireGroupMembership(userId: string, groupId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId, groupId } }
  });
  if (!membership) {
    throw new Error("NOT_A_MEMBER");
  }
}

export async function GET(req: Request) {
  const user = await getAuthedDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId")?.trim();

  if (!groupId) {
    return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
  }

  try {
    await requireGroupMembership(user.id, groupId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { groupId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { clerkId: true, email: true } } }
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content,
      groupId: m.groupId,
      createdAt: m.createdAt.toISOString(),
      sender: m.user.clerkId === "ai" ? "StudySync AI" : m.user.email.split("@")[0] || m.user.email,
      role: m.user.clerkId === "ai" ? "ai" : "student"
    }))
  });
}

export async function POST(req: Request) {
  const user = await getAuthedDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | { groupId?: string; content?: string }
    | null;

  const groupId = body?.groupId?.trim();
  const content = body?.content?.trim();

  if (!groupId || !content) {
    return NextResponse.json({ error: "Invalid body. Expected { groupId, content }." }, { status: 400 });
  }

  try {
    await requireGroupMembership(user.id, groupId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const created = await prisma.message.create({
    data: {
      groupId,
      userId: user.id,
      content
    },
    include: { user: { select: { email: true } } }
  });

  return NextResponse.json({
    message: {
      id: created.id,
      content: created.content,
      groupId: created.groupId,
      createdAt: created.createdAt.toISOString(),
      sender: created.user.email.split("@")[0] || created.user.email,
      role: "student"
    }
  });
}
