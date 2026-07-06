import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import AdminAccessGate from "@/components/AdminAccessGate";
import AdminCatalogTable from "@/components/AdminCatalogTable";
import AdminProductsTable from "@/components/AdminProductsTable";
import { getAdminCatalogs } from "@/lib/adminCatalogs";
import { getAdminProducts } from "@/lib/adminProducts";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import SiteFooter from "@/components/SiteFooter";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  const [catalogs, products] = await Promise.all([
    getAdminCatalogs(),
    getAdminProducts(),
  ]);
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
    <div className="fluid-home dark flex min-h-svh flex-col bg-background text-foreground">
      <div className="fluid-home-noise" />
      <Navigation />

      <main className="relative flex-1 overflow-hidden">
        <div className="fluid-home-gradient-blur" />

        <AdminAccessGate session={session} />

        <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
          <Tabs defaultValue="catalog" className="w-full">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-blue-400">
                  Workspace
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-normal text-foreground">
                  Store management
                </h2>
              </div>

              <TabsList
                aria-label="Admin workspace sections"
                className="border-white/10 bg-white/5"
              >
                <TabsTrigger
                  value="catalog"
                  className="text-slate-400 hover:bg-white/10 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Catalog
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className="text-slate-400 hover:bg-white/10 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Products
                </TabsTrigger>
                <TabsTrigger
                  value="pages"
                  className="text-slate-400 hover:bg-white/10 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Page controls
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="catalog">
              <AdminCatalogTable catalogs={catalogs} />
            </TabsContent>

            <TabsContent value="products">
              <AdminProductsTable products={products} />
            </TabsContent>

            <TabsContent value="pages">
              <div className="overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Page controls
                  </h3>
                  <span className="text-xs font-medium text-slate-400">
                    0 controls
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-white/5 text-xs font-semibold uppercase tracking-normal text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Control</th>
                        <th className="px-4 py-3">Page</th>
                        <th className="px-4 py-3">State</th>
                        <th className="px-4 py-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-sm text-slate-400"
                        >
                          No page controls configured.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
