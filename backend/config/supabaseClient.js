import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Get env
const envFile = `.env.${process.env.NODE_ENV || "dev"}`;
dotenv.config({ path: envFile });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or KEY is missing in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
