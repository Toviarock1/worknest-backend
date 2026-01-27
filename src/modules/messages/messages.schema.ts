import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    projectId: z.uuid(),
    content: z.string(),
  }),
});
