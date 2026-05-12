import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeEnv = process.env.NODE_ENV || "production";

dotenv.config({ path: path.resolve(__dirname, `../.env.${nodeEnv}`) });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or KEY is missing in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
