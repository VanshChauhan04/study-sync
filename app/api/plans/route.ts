import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedDbUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthedDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const latest = await prisma.plan.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    plan: latest
      ? {
          id: latest.id,
          content: latest.content,
          createdAt: latest.createdAt.toISOString()
        }
      : null
  });
}

export async function POST(req: Request) {
  const user = await getAuthedDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { content?: unknown } | null;

  if (!body || typeof body.content === "undefined") {
    return NextResponse.json({ error: "Invalid body. Expected { content }." }, { status: 400 });
  }

  const latest = await prisma.plan.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  const saved = latest
    ? await prisma.plan.update({
        where: { id: latest.id },
        data: { content: body.content as never }
      })
    : await prisma.plan.create({
        data: { userId: user.id, content: body.content as never }
      });

  return NextResponse.json({
    plan: {
      id: saved.id,
      content: saved.content,
      createdAt: saved.createdAt.toISOString()
    }
  });
}
