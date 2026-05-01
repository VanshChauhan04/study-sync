import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedDbUser } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { _count: { select: { memberships: true } } }
  });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const already = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId: id } }
  });
  if (already) {
    return NextResponse.json({ ok: true });
  }

  if (group._count.memberships >= group.maxMembers) {
    return NextResponse.json({ error: "Group is full" }, { status: 409 });
  }

  await prisma.membership.create({
    data: { userId: user.id, groupId: id }
  });

  return NextResponse.json({ ok: true });
}
