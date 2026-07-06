import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";
import SupabaseDataDebug from "@/components/SupabaseDataDebug";
import TopProductsCarousel from "@/components/TopProductsCarousel";
import { getFeaturedProducts, type Product } from "@/lib/products";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const storePillars = [
  {
    title: "Digital and printable",
    description:
      "Prepared for downloads, printable resources, templates, and useful files alongside physical goods.",
  },
  {
    title: "Practical physical goods",
    description:
      "Built to support books, calculators, inks, pens, computer parts, office supplies, and daily essentials.",
  },
  {
    title: "Room to grow",
    description:
      "Flexible enough for new everyday product lines without changing the store's core experience.",
  },
];

export default function Home() {
  const [topProducts, setTopProducts] = useState<
    (Product & { href: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getFeaturedProducts()
      .then((products) => {
        if (!isMounted) return;
        setTopProducts(
          products.map((product) => ({
            ...product,
            href: `/products/${product.id}`,
          })),
        );
      })
      .catch((error) => {
        console.error("Failed to load featured products", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <SupabaseDataDebug
        data={{ topProducts }}
        label="home-page"
        tables={[{ label: "Top products", rows: topProducts }]}
      />
      <Navigation />

      <main className="bg-background text-foreground">
        <section className="relative isolate flex min-h-[72svh] items-center overflow-hidden bg-slate-950">
          <img
            src="/locale-breeze-general-store-hero.png"
            alt="Books, notebooks, pens, ink, a calculator, cables, adapters, and computer parts arranged on a bright store counter"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[64%_center] opacity-60"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />

          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-blue-400">
                Everyday essentials, digital and print
              </p>
              <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
                Locale Breeze Store
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                A flexible neighborhood-style store for digital products, print
                materials, study tools, office supplies, computer basics, and
                useful day-to-day finds.
              </p>
            </div>
          </div>
        </section>

        <section
          id="store-focus"
          className="relative overflow-hidden border-y border-border bg-background"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_40%,transparent_100%)]"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
            <div>
              <p className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-normal text-primary">
                <span className="text-primary/50">//</span> Store focus
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                One store shape for useful products in many formats.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {storePillars.map((pillar, index) => (
                <Card
                  key={pillar.title}
                  className="hover-elevate h-full gap-3 rounded-sm border-l-2 border-y-0 border-r-0 border-border border-l-primary bg-card py-5 shadow-sm"
                >
                  <CardHeader className="px-5">
                    <span className="font-mono text-xs font-semibold tracking-normal text-primary/60">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <CardTitle className="text-lg text-foreground">
                      {pillar.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5">
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      {pillar.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {!isLoading && <TopProductsCarousel products={topProducts} />}

        <section id="store-promise" className="border-t border-border bg-card">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                Store promise
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground">
                Simple, adaptable, and practical.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Locale Breeze Store is designed to feel clear and useful first:
                easy to understand, ready for both digital and physical
                products, and broad enough for common household, school, office,
                and computer needs.
              </p>
              <p>
                Whether the item is a downloadable file, a printed resource, a
                pen, a bottle of ink, or a small computer part, the store keeps
                the presentation grounded in practical everyday use.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
