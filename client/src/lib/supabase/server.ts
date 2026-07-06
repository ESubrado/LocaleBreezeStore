import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseServerConfig } from "@/lib/supabase";
import { toBrowserSessionCookieOptions } from "@/lib/supabase/sessionCookies";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(
              name,
              value,
              toBrowserSessionCookieOptions(value, options),
            );
          });
        } catch {
          // Server Components cannot always write cookies directly. The proxy
          // refreshes sessions before rendering, so this is safe to ignore here.
        }
      },
    },
  });
}
