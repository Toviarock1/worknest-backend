import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format").max(255),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(255),
  }),
});
