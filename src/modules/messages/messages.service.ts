import prisma from "./../../config/db.js";
import {
  ensureIsMember,
  ensureProjectExist,
} from "./../../utils/permissions.js";

async function sendMessage(projectId: string, userId: string, content: string) {
  await ensureProjectExist(projectId);
  await ensureIsMember(projectId, userId);

  return await prisma.message.create({
    data: {
      projectId,
      senderId: userId,
      content,
    },
    include: {
      sender: { select: { name: true, email: true } },
    },
  });
}

async function getProjectChat(projectId: string, userId: string) {
  await ensureProjectExist(projectId);
  await ensureIsMember(projectId, userId);

  return await prisma.message.findMany({
    where: {
      projectId,
    },
    include: {
      sender: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 50,
  });
}

export { sendMessage, getProjectChat };
