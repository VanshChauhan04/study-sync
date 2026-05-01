import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getAuthedDbUser() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const existing = await prisma.user.findUnique({
    where: { clerkId: userId }
  });
  if (existing) {
    return existing;
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return null;
  }

  return prisma.user.create({
    data: {
      clerkId: userId,
      email
    }
  });
}

export async function getAiDbUser() {
  return prisma.user.upsert({
    where: { clerkId: "ai" },
    update: {},
    create: {
      clerkId: "ai",
      email: "ai@studysync.local"
    }
  });
}
