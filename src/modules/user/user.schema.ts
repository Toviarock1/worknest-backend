import { z } from "zod";

export const updateUserSchema = z.object({
  body: z
    .object({
      name: z.string(),
      password: z.string(),
    })
    .partial()
    .refine((data) => data.name !== undefined || data.password !== undefined, {
      message: "At least one of 'name' or 'password' must be provided",
      path: ["name"],
    }),
});
