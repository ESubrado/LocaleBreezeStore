import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SupabaseDataDebug from "@/components/SupabaseDataDebug";
import {
  getProductCatalogPageData,
  type ProductCatalogPageData,
} from "@/lib/products";

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

      <main className="bg-background text-foreground">
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                Product catalog
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Catalogs and sample products for a flexible everyday store.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                Browse sample catalog groups for digital downloads, print
                resources, books, calculators, inks, pens, computer parts, and
                other practical day-to-day products.
              </p>

              <nav
                aria-label="Product catalog sections"
                className="mt-7 flex flex-wrap gap-2"
              >
                {catalogs.map((catalog) => (
                  <a
                    key={catalog.id}
                    href={`#${catalog.slug}`}
                    className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {catalog.title}
                  </a>
                ))}
              </nav>
            </div>

            <div className="relative min-h-72 overflow-hidden rounded-md border border-border bg-muted shadow-sm sm:min-h-96">
              <img
                src={catalogImage}
                alt="Books, calculators, inks, pens, cables, adapters, and computer parts arranged as store samples"
                className="absolute inset-0 h-full w-full object-cover object-[66%_center]"
              />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="catalogs-heading"
          className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:py-16"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                Catalogs
              </p>
              <h2
                id="catalogs-heading"
                className="mt-3 text-3xl font-bold text-foreground"
              >
                Organized by how customers shop.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Each catalog is broad enough for real inventory later while still
              giving customers a clear mental model today.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {catalogs.map((catalog) => (
              <article
                key={catalog.id}
                id={catalog.slug}
                className="grid overflow-hidden rounded-md border border-border bg-card shadow-sm sm:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="relative min-h-56 bg-muted">
                  <img
                    src={catalog.imageUrl}
                    alt={catalog.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: catalog.imagePosition }}
                  />
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {catalog.count}
                    </span>
                    <span className="rounded-sm bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      Catalog
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    {catalog.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {catalog.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {catalog.examples.map((example) => (
                      <li
                        key={example}
                        className="rounded-sm border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="samples-heading"
          className="border-t border-border bg-card"
        >
          <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                  Product samples
                </p>
                <h2
                  id="samples-heading"
                  className="mt-3 text-3xl font-bold text-foreground"
                >
                  Representative items for the first catalog pass.
                </h2>
              </div>
              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="rounded-md border border-border bg-muted/50 p-4">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.sampleProducts}
                  </span>
                  Sample products
                </div>
                <div className="rounded-md border border-border bg-muted/50 p-4">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.catalogGroups}
                  </span>
                  Catalog groups
                </div>
                <div className="rounded-md border border-border bg-muted/50 p-4">
                  <span className="block text-2xl font-bold text-foreground">
                    {stats.digitalFormats}
                  </span>
                  Digital formats
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  href={`/products/${product.id}`}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
