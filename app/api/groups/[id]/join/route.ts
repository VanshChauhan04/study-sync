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
    await prisma.membership.deleteMany({
      where: {
        userId: user.id,
        groupId: { not: id }
      }
    });

    const groups = await getMembershipSnapshot(user.id);
    return NextResponse.json({ ok: true, groups });
  }

  if (group._count.memberships >= group.maxMembers) {
    return NextResponse.json({ error: "Group is full" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.membership.deleteMany({
      where: {
        userId: user.id,
        groupId: { not: id }
      }
    }),
    prisma.membership.create({
      data: { userId: user.id, groupId: id }
    })
  ]);

  const groups = await getMembershipSnapshot(user.id);

  return NextResponse.json({ ok: true, groups });
}

async function getMembershipSnapshot(userId: string) {
  const groups = await prisma.group.findMany({
    include: {
      _count: { select: { memberships: true } },
      memberships: {
        where: { userId },
        select: { id: true }
      }
    }
  });

  return groups.map((group) => ({
    id: group.id,
    members: group._count.memberships,
    isMember: group.memberships.length > 0
  }));
}
