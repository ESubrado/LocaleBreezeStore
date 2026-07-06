"use client";

import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export type AdminSession = {
  email: string;
  expiresAt?: string;
  loggedInAt?: string;
  role: string;
  userId: string;
};

function mapSupabaseSession(session: Session | null): AdminSession | null {
  // Keep the rest of the UI away from Supabase's full session shape. Components
  // only need this small, serializable admin session summary.
  if (!session?.user) {
    return null;
  }

  // Supabase app metadata is optional, so fall back to the normal authenticated
  // role when the project has not assigned a custom admin role.
  const role =
    typeof session.user.app_metadata.role === "string"
      ? session.user.app_metadata.role
      : "authenticated";

  return {
    email: session.user.email ?? "Unknown email",
    expiresAt: session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : undefined,
    // last_sign_in_at is the clearest login timestamp after a sign-in. created_at
    // keeps the field populated for accounts that do not have that value yet.
    loggedInAt: session.user.last_sign_in_at ?? session.user.created_at,
    role,
    userId: session.user.id,
  };
}

export async function getAdminSession() {
  const supabase = createBrowserSupabaseClient();

  // Client-side getSession is only for showing the nav state. The /admin page
  // does its real protection on the server, where users cannot spoof it.
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return mapSupabaseSession(data.session);
}

export function onAdminAuthStateChange(
  callback: (session: AdminSession | null) => void,
) {
  const supabase = createBrowserSupabaseClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    // Normalize every auth event before it reaches React state.
    callback(mapSupabaseSession(session));
  });

  return () => subscription.unsubscribe();
}

export async function signInAdmin(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return {
      error: error.message,
      session: null,
    };
  }

  return {
    error: "",
    session: mapSupabaseSession(data.session),
  };
}

export async function signOutAdmin() {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signOut();

  return {
    error: error?.message ?? "",
  };
}
