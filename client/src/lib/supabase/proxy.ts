import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerConfig } from "@/lib/supabase";
import {
  ADMIN_BROWSER_SESSION_COOKIE,
  isAdminBrowserSessionCookieValue,
  toBrowserSessionCookieOptions,
} from "@/lib/supabase/sessionCookies";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { supabaseUrl, supabaseAnonKey } = getSupabaseServerConfig();
  const isAdminRoute =
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/");
  const hasAdminBrowserSession = isAdminBrowserSessionCookieValue(
    request.cookies.get(ADMIN_BROWSER_SESSION_COOKIE)?.value,
  );

  if (isAdminRoute && !hasAdminBrowserSession) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("admin", "login-required");

    return NextResponse.redirect(redirectUrl);
  }

  // Always create this client per request. It reads incoming auth cookies and
  // writes any refreshed cookies back to the response below.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(
            name,
            value,
            toBrowserSessionCookieOptions(value, options),
          );
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  // Keep this call immediately after createServerClient. Supabase uses it to
  // validate/refresh auth cookies before protected Server Components render.
  const { data, error } = await supabase.auth.getClaims();

  if (isAdminRoute && (error || !data?.claims)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("admin", "login-required");

    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
