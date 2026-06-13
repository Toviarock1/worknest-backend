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
  data: {
    title: string;
    projectId: string;
    assignedToId?: string;
    description?: string;
    parentId?: string;
  },
  userId: string,
) {
  await ensureIsMember(data.projectId, userId);

  // If a parent is provided, make sure it belongs to the same project to avoid
  // cross-project orphan trees.
  if (data.parentId) {
    const parent = await prisma.task.findUnique({
      where: { id: data.parentId },
      select: { projectId: true },
    });
    if (!parent || parent.projectId !== data.projectId) {
      throw new AppError(
        "Parent task does not belong to this project",
        statusCodes.BAD_REQUEST,
      );
    }
  }

  return await prisma.task.create({
    data: {
      title: data.title,
      projectId: data.projectId,
      assignedToId: data.assignedToId,
      description: data.description,
      parentId: data.parentId,
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
  await ensureIsMember(projectId, userId);

  const projectTasks = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      tasks: {
        include: {
          assignedTo: {
            select: {
              name: true,
              email: true,
              id: true,
            },
          },
          // Subtasks for inline progress on the kanban card; minimal fields.
          subtasks: {
            select: { id: true, title: true, status: true },
            orderBy: { createdAt: "asc" },
          },
          files: {
            select: { id: true, name: true, url: true, size: true },
          },
          outgoingLinks: {
            select: {
              id: true,
              type: true,
              toTask: { select: { id: true, title: true, status: true } },
            },
          },
          incomingLinks: {
            select: {
              id: true,
              type: true,
              fromTask: { select: { id: true, title: true, status: true } },
            },
          },
        },
      },
    },
  });

  if (!projectTasks)
    throw new AppError("Project not found", statusCodes.NOTFOUND);

  return projectTasks;
}

async function updateTaskStatus(
  taskId: string,
  updates: {
    status?: TaskStatus;
    title?: string;
    description?: string;
  },
  userId: string,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) throw new AppError("Task not found", statusCodes.NOTFOUND);

  await ensureIsMember(task.projectId, userId);

  const editingContent =
    updates.title !== undefined || updates.description !== undefined;
  if (editingContent) {
    await ensureIsProjectOwner(task.projectId, userId);
  }

  const data: Record<string, unknown> = {};
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.description !== undefined) data.description = updates.description;

  const updatedTaskStats = await prisma.task.update({
    where: { id: taskId },
    data,
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

  if (!task) throw new AppError("Task not found", statusCodes.NOTFOUND);

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
