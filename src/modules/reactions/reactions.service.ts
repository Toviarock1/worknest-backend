import prisma from "./../../config/db.js";
import statusCodes from "./../../constants/statusCodes.js";
import { AppError } from "./../../utils/AppError.js";
import { ensureIsMember } from "./../../utils/permissions.js";

export type ToggleResult =
  | { kind: "added"; messageId: string; emoji: string; userId: string; projectId: string }
  | { kind: "removed"; messageId: string; emoji: string; userId: string; projectId: string };

export async function toggleReaction(
  messageId: string,
  userId: string,
  emoji: string,
): Promise<ToggleResult> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, projectId: true },
  });
  if (!message) throw new AppError("Message not found", statusCodes.NOTFOUND);

  await ensureIsMember(message.projectId, userId);

  // Try delete first — if it existed we're done (toggle off).
  const removed = await prisma.messageReaction.deleteMany({
    where: { messageId, userId, emoji },
  });
  if (removed.count > 0) {
    return {
      kind: "removed",
      messageId,
      emoji,
      userId,
      projectId: message.projectId,
    };
  }

  // Otherwise insert.
  await prisma.messageReaction.create({
    data: { messageId, userId, emoji },
  });
  return {
    kind: "added",
    messageId,
    emoji,
    userId,
    projectId: message.projectId,
  };
}
