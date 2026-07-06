import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedSupabase: SupabaseClient | null = null;

export function getSupabaseServerConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY, or the NEXT_PUBLIC_SUPABASE_* equivalents, in your environment.",
    );
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/+$/, ""),
    supabaseAnonKey,
  };
}

export function getSupabaseClient() {
  if (cachedSupabase) {
    return cachedSupabase;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig();

  // The anon/publishable key is safe to use here because Supabase row level
  // security decides which rows that key is allowed to read.
  cachedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  return cachedSupabase;
}
