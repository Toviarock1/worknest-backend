import { z } from "zod";

export const createSchema = z.object({
  body: z.object({
    name: z.string().max(225),
  }),
});

export const updateSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty"),
      description: z.string().min(1, "Description cannot be empty"),
    })
    .partial()
    .refine(
      (data) => data.name !== undefined || data.description !== undefined,
      {
        message: "At least one of 'name' or 'description' must be provided",
        path: ["name"],
      }
    ),
});

export const addMemberSchema = z.object({
  body: z.object({
    projectId: z.uuid(),
    userEmail: z.email("Invalid email format").max(255),
  }),
});

// export const listProjectMembersSchema = z.object({
//   params: z.object({
//     id: z.string(":id  is required").max(255),
//   }),
// });
