import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SupabaseDataDebug from "@/components/SupabaseDataDebug";
import {
  getProductCatalogPageData,
  type ProductCatalogPageData,
} from "@/lib/products";
import "@/styles/fluid-theme.css";

const emptyData: ProductCatalogPageData = {
  catalogImage: "/locale-breeze-general-store-hero.png",
  catalogs: [],
  products: [],
  stats: { sampleProducts: 0, catalogGroups: 0, digitalFormats: 0 },
};

export default function Products() {
  const [data, setData] = useState<ProductCatalogPageData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getProductCatalogPageData()
      .then((pageData) => {
        if (isMounted) {
          setData(pageData);
        }
      })
      .catch((error) => {
        console.error("Failed to load product catalog page data", error);
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

  const { catalogImage, catalogs, products, stats } = data;

  return (
    <>
      <SupabaseDataDebug
        data={{ catalogs, products, stats }}
        label="products-page"
        tables={[
          { label: "Catalogs", rows: catalogs },
          { label: "Products", rows: products },
        ]}
      />
      <Navigation />

      <main className="fluid-home dark bg-background text-foreground">
        <div className="fluid-home-noise" />

        <section className="relative overflow-hidden px-5 pt-24 pb-16 sm:px-8 lg:pb-24">
          <div className="fluid-home-gradient-blur" />
          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Product catalog
              </p>
              <h1 className="mt-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl lg:text-6xl">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative min-h-72 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 sm:min-h-96"
            >
              <img
                src={catalogImage}
                alt="Books, calculators, inks, pens, cables, adapters, and computer parts arranged as store samples"
                className="absolute inset-0 h-full w-full object-cover object-[66%_center]"
              />
            </motion.div>
          </div>
        </section>

        <section
          aria-labelledby="catalogs-heading"
          className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Catalogs
              </p>
              <h2
                id="catalogs-heading"
                className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                Organized by how customers shop.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Each catalog is broad enough for real inventory later while
              still giving customers a clear mental model today.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {catalogs.map((catalog, idx) => (
              <motion.article
                key={catalog.id}
                id={catalog.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: (idx % 2) * 0.1 }}
                className="group grid overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition-all hover:bg-white/10 sm:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="relative min-h-56 overflow-hidden bg-black">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                  <img
                    src={catalog.imageUrl}
                    alt={catalog.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: catalog.imagePosition }}
                  />
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      {catalog.count}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                      Catalog
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
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
              </motion.article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="samples-heading"
          className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md"
        >
          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                  Product samples
                </p>
                <h2
                  id="samples-heading"
                  className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  Representative items for the first catalog pass.
                </h2>
              </div>
              <div className="grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.sampleProducts}
                  </span>
                  Sample products
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.catalogGroups}
                  </span>
                  Catalog groups
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.digitalFormats}
                  </span>
                  Digital formats
                </div>
              </div>
            </motion.div>

            {isLoading && (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="aspect-[4/3] w-full animate-pulse rounded-3xl bg-white/5 ring-1 ring-white/10"
                  />
                ))}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <p className="mt-10 text-slate-400">
                No products are available yet.
              </p>
            )}

            {!isLoading && products.length > 0 && (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: (idx % 4) * 0.08 }}
                  >
                    <ProductCard
                      {...product}
                      href={`/products/${product.id}`}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
