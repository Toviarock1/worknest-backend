import prisma from "./../../config/db.js";
import statusCodes from "./../../constants/statusCodes.js";
import { AppError } from "./../../utils/AppError.js";
import { ensureIsMember } from "./../../utils/permissions.js";

async function loadTaskOrThrow(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true },
  });
  if (!task) throw new AppError("Task not found", statusCodes.NOTFOUND);
  return task;
}

export async function listForTask(taskId: string, userId: string) {
  const task = await loadTaskOrThrow(taskId);
  await ensureIsMember(task.projectId, userId);

  return prisma.taskComment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function create(
  taskId: string,
  userId: string,
  content: string,
) {
  const task = await loadTaskOrThrow(taskId);
  await ensureIsMember(task.projectId, userId);

  const comment = await prisma.taskComment.create({
    data: {
      content,
      taskId,
      authorId: userId,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  });

  return { comment, projectId: task.projectId };
}

export async function remove(commentId: string, userId: string) {
  const comment = await prisma.taskComment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      taskId: true,
      task: { select: { projectId: true } },
    },
  });

  if (!comment) throw new AppError("Comment not found", statusCodes.NOTFOUND);

  // Only the author can delete their own comment.
  if (comment.authorId !== userId) {
    throw new AppError("Not allowed", statusCodes.FORBIDDEN);
  }

  await prisma.taskComment.delete({ where: { id: commentId } });

  return {
    commentId,
    taskId: comment.taskId,
    projectId: comment.task.projectId,
  };
}
