import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title too short"),
    projectId: z.uuid("Invalid project ID"),
    assignedToId: z.uuid().optional(),
    status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["todo", "in_progress", "done"]),
  }),
});

export const assignTaskSchema = z.object({
  body: z.object({
    assigneeEmail: z.email(),
    projectId: z.uuid("Invalid project ID"),
  }),
});
