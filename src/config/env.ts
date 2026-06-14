import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5050),
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().min(2).max(3),
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_STORAGE_BUCKET: z.string().default("worknest-files"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  // fix this
  console.log(
    `Invalid Environment Variables: ${JSON.stringify(
      z.treeifyError(_env.error),
      null,
      2,
    )}`,
  );
  process.exit(1);
}

export const env = _env.data;
