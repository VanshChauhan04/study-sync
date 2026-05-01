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

  await prisma.membership.deleteMany({
    where: { userId: user.id, groupId: id }
  });

  return NextResponse.json({ ok: true });
}
