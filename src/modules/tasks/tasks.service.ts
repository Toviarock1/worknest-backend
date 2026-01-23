import { ensureIsMember } from "utils/permissions";
import prisma from "./../../config/db";
import statusCodes from "./../../constants/statusCodes";
import { AppError } from "./../../utils/AppError";

async function createTask(
  data: { title: string; projectId: string; assignedToId: string },
  userId: string
) {
  await ensureIsMember(data.projectId, userId);

  return await prisma.task.create({
    data: {
      title: data.title,
      projectId: data.projectId,
      assignedToId: data.assignedToId,
    },
    include: {
      assignedTo: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

async function listTasks(projectId: string, userId: string) {
  const projectTasks = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      tasks: true,
    },
  });

  if (!projectTasks)
    throw new AppError("Project not found", statusCodes.NOTFOUND);

  await ensureIsMember(projectId, userId);

  return projectTasks;
}

export { createTask, listTasks };
