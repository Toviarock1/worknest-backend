import {
  ensureIsMember,
  ensureIsProjectOwner,
  ensureProjectExist,
  ensureTasksExist,
  ensureUserExist,
} from "./../../utils/permissions.js";
import prisma from "./../../config/db.js";
import statusCodes from "./../../constants/statusCodes.js";
import { AppError } from "./../../utils/AppError.js";
import { TaskStatus } from "./../../generated/prisma/enums.js";

async function createTask(
  data: { title: string; projectId: string; assignedToId: string },
  userId: string,
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

async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  userId: string,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) throw new AppError("Task not found", statusCodes.NOTFOUND);

  await ensureIsMember(task.projectId, userId);

  const updatedTaskStats = await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
    },
  });

  return { ...updatedTaskStats, projectId: task.projectId };
}

async function assignProjectTask(
  taskId: string,
  projectId: string,
  userId: string,
  assigneeEmail: string,
) {
  await ensureProjectExist(projectId);
  await ensureIsMember(projectId, userId);

  const assignee = await ensureUserExist(assigneeEmail);

  const assignTaskToMember = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      assignedToId: assignee.id,
    },
  });

  return assignTaskToMember;
}

async function deleteProjectTask(taskId: string, userId: string) {
  await ensureTasksExist(taskId);
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  await ensureIsProjectOwner(task.projectId, userId);

  return await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
}

export {
  createTask,
  listTasks,
  updateTaskStatus,
  assignProjectTask,
  deleteProjectTask,
};
