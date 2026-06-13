import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title too short"),
    projectId: z.uuid("Invalid project ID"),
    assignedToId: z.uuid().optional(),
    status: z.enum(["todo", "in_progress", "done"]).default("todo"),
    parentId: z.uuid().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z
    .object({
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      title: z.string().min(3, "Title too short").optional(),
      description: z.string().optional(),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const updateStatusSchema = updateTaskSchema;

export const assignTaskSchema = z.object({
  body: z.object({
    assigneeEmail: z.email(),
    projectId: z.uuid("Invalid project ID"),
  }),
});
