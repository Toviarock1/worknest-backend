import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Server-side client using the service role key. Never expose this key to
// the frontend — it bypasses Row-Level Security on every Supabase resource.
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  },
);

export const STORAGE_BUCKET = env.SUPABASE_STORAGE_BUCKET;

export default supabase;
