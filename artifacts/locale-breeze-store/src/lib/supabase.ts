import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedSupabase: SupabaseClient | null = null;

export function getSupabaseConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export function getSupabaseClient() {
  if (cachedSupabase) {
    return cachedSupabase;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  // The anon/publishable key is safe to use here because Supabase row level
  // security decides which rows that key is allowed to read.
  cachedSupabase = createClient(supabaseUrl, supabaseAnonKey);

  return cachedSupabase;
}
