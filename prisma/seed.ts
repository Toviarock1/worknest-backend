import bcrypt from "bcrypt";
import prisma from "../src/config/db.js";

const PASSWORD = "Password123!";

async function main() {
  console.log("Seeding database…");

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // Wipe existing data in dependency order so the seed is idempotent.
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.file.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskLink.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const [alice, bob, carol, dave] = await Promise.all([
    prisma.user.create({
      data: { name: "Alice Owner", email: "alice@worknest.dev", password: passwordHash },
    }),
    prisma.user.create({
      data: { name: "Bob Builder", email: "bob@worknest.dev", password: passwordHash },
    }),
    prisma.user.create({
      data: { name: "Carol Coder", email: "carol@worknest.dev", password: passwordHash },
    }),
    prisma.user.create({
      data: { name: "Dave Designer", email: "dave@worknest.dev", password: passwordHash },
    }),
  ]);

  const apollo = await prisma.project.create({
    data: {
      name: "Apollo Launch",
      description: "Website relaunch for the Apollo product line.",
      ownerId: alice.id,
      projectMembers: {
        create: [
          { userId: alice.id, role: "owner" },
          { userId: bob.id, role: "member" },
          { userId: carol.id, role: "member" },
        ],
      },
    },
  });

  const orion = await prisma.project.create({
    data: {
      name: "Orion Mobile",
      description: "Native mobile companion app.",
      ownerId: bob.id,
      projectMembers: {
        create: [
          { userId: bob.id, role: "owner" },
          { userId: alice.id, role: "member" },
          { userId: dave.id, role: "member" },
        ],
      },
    },
  });

  const landing = await prisma.task.create({
    data: {
      title: "Design new landing page",
      description: "Hero + features + pricing sections.",
      projectId: apollo.id,
      assignedToId: carol.id,
      status: "in_progress",
    },
  });

  await prisma.task.createMany({
    data: [
      { title: "Draft copy for hero section", projectId: apollo.id, parentId: landing.id, assignedToId: bob.id, status: "todo" },
      { title: "Export design tokens", projectId: apollo.id, parentId: landing.id, assignedToId: carol.id, status: "done" },
    ],
  });

  const auth = await prisma.task.create({
    data: {
      title: "Wire up auth flow",
      description: "Login, signup, password reset.",
      projectId: apollo.id,
      assignedToId: bob.id,
      status: "todo",
    },
  });

  await prisma.taskLink.create({
    data: { fromTaskId: auth.id, toTaskId: landing.id, type: "blocks", createdById: alice.id },
  });

  await prisma.task.createMany({
    data: [
      { title: "Set up React Native project", projectId: orion.id, assignedToId: dave.id, status: "done" },
      { title: "Implement bottom tab navigation", projectId: orion.id, assignedToId: dave.id, status: "in_progress" },
      { title: "Configure push notifications", projectId: orion.id, assignedToId: bob.id, status: "todo" },
    ],
  });

  await prisma.taskComment.createMany({
    data: [
      { taskId: landing.id, authorId: alice.id, content: "Let's align on the hero copy by Friday." },
      { taskId: landing.id, authorId: carol.id, content: "First draft coming later today." },
      { taskId: auth.id, authorId: bob.id, content: "Blocked on the design tokens." },
    ],
  });

  const apolloMsg = await prisma.message.create({
    data: { projectId: apollo.id, senderId: alice.id, content: "Kickoff for Apollo Launch — welcome team!" },
  });
  await prisma.message.createMany({
    data: [
      { projectId: apollo.id, senderId: bob.id, content: "Excited to be here." },
      { projectId: apollo.id, senderId: carol.id, content: "Uploading initial mocks now." },
      { projectId: orion.id, senderId: bob.id, content: "Orion repo is live. Clone away." },
    ],
  });

  await prisma.messageReaction.createMany({
    data: [
      { messageId: apolloMsg.id, userId: bob.id, emoji: "🚀" },
      { messageId: apolloMsg.id, userId: carol.id, emoji: "👏" },
    ],
  });

  console.log("Seed complete.");
  console.log(`Login with any of: alice / bob / carol / dave @worknest.dev`);
  console.log(`Password: ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
