import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import AdminAccessGate from "@/components/AdminAccessGate";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin | Locale Breeze Store",
  description: "Admin access for Locale Breeze Store.",
};

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  // This is the real admin protection. Browser state is convenient for the nav,
  // but this server check is the gate users cannot bypass by editing local state.
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect("/?admin=login-required");
  }

  const { data: claimsData } = await supabase.auth.getClaims();
  const expiresAt =
    typeof claimsData?.claims.exp === "number"
      ? new Date(claimsData.claims.exp * 1000).toISOString()
      : undefined;

  // For now, any signed-in Supabase Auth user can reach /admin because the
  // project only creates admin accounts. If you later add customer accounts,
  // check a profiles table or app_metadata role here before rendering.
  const session = {
    email: user.email ?? "Unknown email",
    expiresAt,
    loggedInAt: user.last_sign_in_at ?? user.created_at,
    role:
      typeof user.app_metadata.role === "string"
        ? user.app_metadata.role
        : "authenticated",
    userId: user.id,
  };

  return (
    <>
      <Navigation />

      <main className="bg-[#f7faf7] text-stone-950">
        <AdminAccessGate session={session} />
      </main>
    </>
  );
}
