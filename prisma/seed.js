const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const aiUser = await prisma.user.upsert({
    where: { clerkId: "ai" },
    update: {},
    create: {
      clerkId: "ai",
      email: "ai@studysync.local"
    }
  });

  const demoOwner = await prisma.user.upsert({
    where: { clerkId: "seed-owner" },
    update: {},
    create: {
      clerkId: "seed-owner",
      email: "owner@studysync.local"
    }
  });

  const existingGroups = await prisma.group.count();
  if (existingGroups > 0) {
    return;
  }

  const groups = [
    { name: "End-Sem DSA Rescue Room", subject: "Data Structures", maxMembers: 6 },
    { name: "OS Past Papers Sprint", subject: "Operating Systems", maxMembers: 8 },
    { name: "DBMS Normalization Workshop", subject: "Database Systems", maxMembers: 6 },
    { name: "ML Revision Circle", subject: "Machine Learning", maxMembers: 10 },
    { name: "Discrete Math Proof Practice", subject: "Discrete Mathematics", maxMembers: 6 }
  ];

  for (const group of groups) {
    await prisma.group.create({
      data: {
        ...group,
        createdBy: demoOwner.id
      }
    });
  }

  await prisma.message.create({
    data: {
      content: "Seed complete. Sign in to join a group and start chatting.",
      userId: aiUser.id,
      groupId: (await prisma.group.findFirst()).id
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

