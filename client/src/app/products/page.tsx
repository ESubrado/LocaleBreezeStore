import type { Metadata } from "next";
import Image from "next/image";
import { getProductCatalogPageData } from "@/api/products";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Products | Locale Breeze Store",
  description:
    "Browse sample catalogs and products for digital downloads, print materials, office supplies, inks, calculators, computer parts, and everyday essentials.",
};

export default async function Products() {
  const { catalogImage, catalogs, products, stats } =
    await getProductCatalogPageData();

  return (
    <>
      <Navigation />

      <main className="bg-[#f7faf7] text-stone-950">
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-14">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-[#24786b]">
                Product catalog
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">
                Catalogs and sample products for a flexible everyday store.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-700">
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
                    className="inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-[#24786b] hover:text-[#24786b] focus:outline-none focus:ring-2 focus:ring-[#24786b] focus:ring-offset-2"
                  >
                    {catalog.title}
                  </a>
                ))}
              </nav>
            </div>

            <div className="relative min-h-72 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm sm:min-h-96">
              <Image
                src={catalogImage}
                alt="Books, calculators, inks, pens, cables, adapters, and computer parts arranged as store samples"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[66%_center]"
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
              <p className="text-sm font-semibold uppercase tracking-normal text-[#24786b]">
                Catalogs
              </p>
              <h2
                id="catalogs-heading"
                className="mt-3 text-3xl font-bold text-stone-950"
              >
                Organized by how customers shop.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">
              Each catalog is broad enough for real inventory later while still
              giving customers a clear mental model today.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {catalogs.map((catalog) => (
              <article
                key={catalog.id}
                id={catalog.slug}
                className="grid overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm sm:grid-cols-[0.9fr_1.1fr]"
              >
                <div className="relative min-h-56 bg-stone-100">
                  <Image
                    src={catalogImage}
                    alt={catalog.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                    style={{ objectPosition: catalog.imagePosition }}
                  />
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white">
                      {catalog.count}
                    </span>
                    <span className="rounded-full bg-[#e6f2ef] px-3 py-1 text-xs font-semibold text-[#24786b]">
                      Catalog
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-stone-950">
                    {catalog.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {catalog.description}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {catalog.examples.map((example) => (
                      <li
                        key={example}
                        className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600"
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
          className="border-t border-stone-200 bg-white"
        >
          <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-[#b15a2b]">
                  Product samples
                </p>
                <h2
                  id="samples-heading"
                  className="mt-3 text-3xl font-bold text-stone-950"
                >
                  Representative items for the first catalog pass.
                </h2>
              </div>
              <div className="grid gap-3 text-sm text-stone-700 sm:grid-cols-3">
                <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
                  <span className="block text-2xl font-bold text-stone-950">
                    {stats.sampleProducts}
                  </span>
                  Sample products
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
                  <span className="block text-2xl font-bold text-stone-950">
                    {stats.catalogGroups}
                  </span>
                  Catalog groups
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
                  <span className="block text-2xl font-bold text-stone-950">
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
