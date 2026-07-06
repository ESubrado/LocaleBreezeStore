import Navigation from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";
import SupabaseDataDebug from "@/components/SupabaseDataDebug";
import HomeFluidExperience from "@/components/HomeFluidExperience";
import { getFeaturedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const topProducts = (await getFeaturedProducts()).map((product) => ({
    ...product,
    href: `/products/${product.id}`,
  }));

  return (
    <>
      {process.env.NEXT_PUBLIC_SUPABASE_DEBUG === "true" && (
        <SupabaseDataDebug
          data={{ topProducts }}
          label="home-page"
          tables={[{ label: "Top products", rows: topProducts }]}
        />
      )}
      <Navigation />
      <HomeFluidExperience topProducts={topProducts} />
      <SiteFooter />
    </>
  );
}
