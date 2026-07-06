"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getBrowserSupabaseCookies,
  setBrowserSupabaseCookies,
} from "@/lib/supabase/sessionCookies";

let browserClient: SupabaseClient | null = null;

function getSupabaseBrowserConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing browser Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export function createBrowserSupabaseClient() {
  if (browserClient) {
    return browserClient;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseBrowserConfig();

  // Store auth state in browser-session cookies so server components and the
  // browser agree, but closing the browser drops the admin session.
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: getBrowserSupabaseCookies,
      setAll: setBrowserSupabaseCookies,
    },
  });

  return browserClient;
}
