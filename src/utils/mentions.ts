// Shared mention parsing for chat messages + task comments.
// Email prefix is the canonical handle (matches the frontend).

import prisma from "../config/db.js";

const MENTION_REGEX = /@([a-zA-Z0-9._-]+)/g;

export const extractMentionHandles = (text: string): string[] => {
  const seen = new Set<string>();
  for (const match of text.matchAll(MENTION_REGEX)) {
    seen.add(match[1].toLowerCase());
  }
  return Array.from(seen);
};

export interface ResolvedMention {
  userId: string;
  handle: string;
  email: string;
  name: string | null;
}

/**
 * Resolves @handles against the membership of the given project. Only members
 * are considered — strangers can't be pinged into a private project.
 */
export const resolveMentionsForProject = async (
  text: string,
  projectId: string,
): Promise<ResolvedMention[]> => {
  const handles = extractMentionHandles(text);
  if (handles.length === 0) return [];

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    select: {
      userId: true,
      user: { select: { name: true, email: true } },
    },
  });

  const byHandle = new Map<string, ResolvedMention>();
  for (const m of members) {
    const handle = m.user.email.split("@")[0]?.toLowerCase();
    if (!handle) continue;
    byHandle.set(handle, {
      userId: m.userId,
      handle,
      email: m.user.email,
      name: m.user.name,
    });
  }

  const out: ResolvedMention[] = [];
  for (const h of handles) {
    const hit = byHandle.get(h);
    if (hit) out.push(hit);
  }
  return out;
};
