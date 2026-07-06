import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import AdminAccessGate from "@/components/AdminAccessGate";
import AdminCatalogTable from "@/components/AdminCatalogTable";
import AdminProductsTable from "@/components/AdminProductsTable";
import SiteFooter from "@/components/SiteFooter";
import { getAdminCatalogs, type AdminCatalog } from "@/lib/adminCatalogs";
import { getAdminProducts, type AdminProduct } from "@/lib/adminProducts";
import { getAdminSession } from "@/lib/adminAuth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import "@/styles/fluid-theme.css";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"checking" | "authorized">(
    "checking",
  );
  const [session, setSession] = useState<{
    email: string;
    expiresAt?: string;
    loggedInAt?: string;
    role: string;
    userId: string;
  } | null>(null);
  const [catalogs, setCatalogs] = useState<AdminCatalog[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    let isMounted = true;

    // Client-side gate: browser has no server session, so this check runs on
    // mount. Real protection still depends on Supabase RLS for the tables below.
    getAdminSession()
      .then(async (adminSession) => {
        if (!isMounted) return;

        if (!adminSession) {
          setLocation("/?admin=login-required");
          return;
        }

        setSession(adminSession);
        setStatus("authorized");

        const [catalogsResult, productsResult] = await Promise.all([
          getAdminCatalogs(),
          getAdminProducts(),
        ]);

        if (isMounted) {
          setCatalogs(catalogsResult);
          setProducts(productsResult);
        }
      })
      .catch((error) => {
        console.error("Failed to verify admin session", error);
        if (isMounted) {
          setLocation("/?admin=login-required");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setLocation]);

  if (status === "checking" || !session) {
    return (
      <div className="fluid-home dark flex min-h-svh flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center text-slate-400">
          Checking admin access...
        </main>
        <SiteFooter />
      </div>
    );
  }

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
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  Workspace
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
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
              <div className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
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
                    <thead className="bg-white/5 text-xs font-semibold uppercase tracking-widest text-slate-400">
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
