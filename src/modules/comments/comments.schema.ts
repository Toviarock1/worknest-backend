import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Empty comment").max(4000, "Too long"),
  }),
  params: z.object({
    taskId: z.uuid("Invalid task id"),
  }),
});

export const listCommentsSchema = z.object({
  params: z.object({
    taskId: z.uuid("Invalid task id"),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    commentId: z.uuid("Invalid comment id"),
  }),
});
