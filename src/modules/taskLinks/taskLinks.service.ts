import prisma from "./../../config/db.js";
import statusCodes from "./../../constants/statusCodes.js";
import { AppError } from "./../../utils/AppError.js";
import { ensureIsMember } from "./../../utils/permissions.js";
import type { LinkType } from "./taskLinks.schema.js";

const INVERSE: Record<LinkType, LinkType> = {
  blocks: "blocked_by",
  blocked_by: "blocks",
  related_to: "related_to",
};

export async function createLink(
  fromTaskId: string,
  targetTaskId: string,
  type: LinkType,
  userId: string,
) {
  if (fromTaskId === targetTaskId) {
    throw new AppError("Can't link a task to itself", statusCodes.BAD_REQUEST);
  }

  const [from, to] = await Promise.all([
    prisma.task.findUnique({
      where: { id: fromTaskId },
      select: { id: true, projectId: true },
    }),
    prisma.task.findUnique({
      where: { id: targetTaskId },
      select: { id: true, projectId: true },
    }),
  ]);

  if (!from || !to) throw new AppError("Task not found", statusCodes.NOTFOUND);
  if (from.projectId !== to.projectId) {
    throw new AppError(
      "Both tasks must belong to the same project",
      statusCodes.BAD_REQUEST,
    );
  }

  await ensureIsMember(from.projectId, userId);

  // Idempotent: if the link already exists, surface it instead of throwing on
  // the unique constraint.
  const existing = await prisma.taskLink.findFirst({
    where: { fromTaskId, toTaskId: targetTaskId, type },
  });
  if (existing) return { link: existing, projectId: from.projectId };

  const link = await prisma.taskLink.create({
    data: {
      fromTaskId,
      toTaskId: targetTaskId,
      type,
      createdById: userId,
    },
    include: {
      toTask: { select: { id: true, title: true, status: true } },
    },
  });

  return { link, projectId: from.projectId, inverse: INVERSE[type] };
}

export async function deleteLink(linkId: string, userId: string) {
  const link = await prisma.taskLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      fromTaskId: true,
      toTaskId: true,
      fromTask: { select: { projectId: true } },
    },
  });
  if (!link) throw new AppError("Link not found", statusCodes.NOTFOUND);

  await ensureIsMember(link.fromTask.projectId, userId);

  await prisma.taskLink.delete({ where: { id: linkId } });

  return {
    linkId,
    fromTaskId: link.fromTaskId,
    toTaskId: link.toTaskId,
    projectId: link.fromTask.projectId,
  };
}
