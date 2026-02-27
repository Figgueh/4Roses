import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  //Remember me
  {
    auth: {
      persistSession: true,
      storageKey: "sb-session",
      storage: sessionStorage.getItem("sb-session") ? sessionStorage : localStorage,
    },
  }
);

export default supabase;
