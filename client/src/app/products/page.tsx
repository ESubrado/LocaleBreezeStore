import type { Metadata } from "next";
import Image from "next/image";
import productsTechBg from "@/app/assets/products-tech-bg.png";
import { getProductCatalogPageData } from "@/lib/products";
import MotionReveal from "@/components/MotionReveal";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SupabaseDataDebug from "@/components/SupabaseDataDebug";

export const metadata: Metadata = {
  title: "Products | Locale Breeze Store",
  description:
    "Browse sample catalogs and products for digital downloads, print materials, office supplies, inks, calculators, computer parts, and everyday essentials.",
};

export const dynamic = "force-dynamic";

export default async function Products() {
  const { catalogImage, catalogs, products, stats } =
    await getProductCatalogPageData();

  return (
    <>
      {process.env.NEXT_PUBLIC_SUPABASE_DEBUG === "true" && (
        <SupabaseDataDebug
          data={{ catalogs, products, stats }}
          label="products-page"
          tables={[
            { label: "Catalogs", rows: catalogs },
            { label: "Products", rows: products },
          ]}
        />
      )}
      <Navigation />

      <main className="fluid-home dark isolate bg-background text-foreground">
        <div
          className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${productsTechBg.src})` }}
        />
        <div className="fixed inset-0 -z-30 bg-gradient-to-b from-slate-950/40 via-slate-950/75 to-slate-950" />
        <div className="fluid-home-noise" />

        <section className="relative overflow-hidden px-5 pb-16 pt-24 sm:px-8 lg:pb-24">
          <div className="fluid-home-gradient-blur" />
          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <MotionReveal>
              <p className="text-sm font-semibold uppercase tracking-normal text-blue-400">
                Product catalog
              </p>
              <h1 className="mt-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-4xl font-bold leading-tight tracking-normal text-transparent sm:text-5xl lg:text-6xl">
                Catalogs and sample products for a flexible everyday store.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
                Browse sample catalog groups for digital downloads, print
                resources, books, calculators, inks, pens, computer parts, and
                other practical day-to-day products.
              </p>

              <nav
                aria-label="Product catalog sections"
                className="mt-8 flex flex-wrap gap-2"
              >
                {catalogs.map((catalog) => (
                  <a
                    key={catalog.id}
                    href={`#${catalog.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    {catalog.title}
                  </a>
                ))}
              </nav>
            </MotionReveal>

            <MotionReveal
              delay={0.15}
              className="relative min-h-72 overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 sm:min-h-96"
            >
              <Image
                src={catalogImage}
                alt="Books, calculators, inks, pens, cables, adapters, and computer parts arranged as store samples"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[66%_center]"
              />
            </MotionReveal>
          </div>
        </section>

        <section
          aria-labelledby="catalogs-heading"
          className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
        >
          <MotionReveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-blue-400">
                Catalogs
              </p>
              <h2
                id="catalogs-heading"
                className="mt-3 text-3xl font-bold tracking-normal text-foreground sm:text-4xl"
              >
                Organized by how customers shop.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Each catalog is broad enough for real inventory later while still
              giving customers a clear mental model today.
            </p>
          </MotionReveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {catalogs.map((catalog, index) => (
              <MotionReveal
                key={catalog.id}
                id={catalog.slug}
                role="article"
                delay={(index % 2) * 0.1}
                className="group grid overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 transition-all hover:bg-white/10 sm:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="relative min-h-56 overflow-hidden bg-black">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                  <Image
                    src={catalog.imageUrl}
                    alt={catalog.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: catalog.imagePosition }}
                  />
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      {catalog.count}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      Catalog
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-normal text-foreground">
                    {catalog.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {catalog.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {catalog.examples.map((example) => (
                      <li
                        key={example}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-400"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </MotionReveal>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="samples-heading"
          className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md"
        >
          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
            <MotionReveal className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-blue-400">
                  Product samples
                </p>
                <h2
                  id="samples-heading"
                  className="mt-3 text-3xl font-bold tracking-normal text-foreground sm:text-4xl"
                >
                  Representative items for the first catalog pass.
                </h2>
              </div>
              <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
                <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.sampleProducts}
                  </span>
                  Sample products
                </div>
                <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.catalogGroups}
                  </span>
                  Catalog groups
                </div>
                <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.digitalFormats}
                  </span>
                  Digital formats
                </div>
              </div>
            </MotionReveal>

            {products.length > 0 ? (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product, index) => (
                  <MotionReveal key={product.id} delay={(index % 4) * 0.08}>
                    <ProductCard {...product} href={`/products/${product.id}`} />
                  </MotionReveal>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-slate-400">
                No products are available yet.
              </p>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
