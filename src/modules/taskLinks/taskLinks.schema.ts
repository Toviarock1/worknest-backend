import { z } from "zod";

export const LINK_TYPES = ["blocks", "blocked_by", "related_to"] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export const createLinkSchema = z.object({
  params: z.object({
    taskId: z.uuid("Invalid task id"),
  }),
  body: z.object({
    targetTaskId: z.uuid("Invalid target task id"),
    type: z.enum(LINK_TYPES),
  }),
});

export const deleteLinkSchema = z.object({
  params: z.object({
    linkId: z.uuid("Invalid link id"),
  }),
});
