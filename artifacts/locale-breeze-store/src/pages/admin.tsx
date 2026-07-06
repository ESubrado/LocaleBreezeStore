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
      <div className="flex min-h-svh flex-col">
        <Navigation />
        <main className="flex flex-1 items-center justify-center bg-[#f7faf7] text-stone-500">
          Checking admin access...
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navigation />

      <main className="flex-1 bg-[#f7faf7] text-stone-950">
        <AdminAccessGate session={session} />

        <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:pb-16">
          <Tabs defaultValue="catalog" className="w-full">
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-[#24786b]">
                  Workspace
                </p>
                <h2 className="mt-2 text-2xl font-bold text-stone-950">
                  Store management
                </h2>
              </div>

              <TabsList aria-label="Admin workspace sections">
                <TabsTrigger value="catalog">Catalog</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="pages">Page controls</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="catalog">
              <AdminCatalogTable catalogs={catalogs} />
            </TabsContent>

            <TabsContent value="products">
              <AdminProductsTable products={products} />
            </TabsContent>

            <TabsContent value="pages">
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-4 py-3">
                  <h3 className="text-sm font-semibold text-stone-950">
                    Page controls
                  </h3>
                  <span className="text-xs font-medium text-stone-500">
                    0 controls
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-[#fbfcf8] text-xs font-semibold uppercase tracking-normal text-stone-500">
                      <tr>
                        <th className="px-4 py-3">Control</th>
                        <th className="px-4 py-3">Page</th>
                        <th className="px-4 py-3">State</th>
                        <th className="px-4 py-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-sm text-stone-500"
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
