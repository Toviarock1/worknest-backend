import { z } from "zod";

// Lock the allowed emoji set so the column doesn't become a free-form sink.
// Same six we expose in the picker on the client.
export const ALLOWED_EMOJI = ["👍", "❤️", "😂", "🎉", "👀", "🙏"] as const;
export type AllowedEmoji = (typeof ALLOWED_EMOJI)[number];

export const toggleReactionSchema = z.object({
  params: z.object({
    messageId: z.uuid("Invalid message id"),
    emoji: z.enum(ALLOWED_EMOJI),
  }),
});
