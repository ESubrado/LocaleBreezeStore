import type { Metadata } from "next";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import ProductCard, { type ProductCardProps } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Products | Locale Breeze Store",
  description:
    "Browse sample catalogs and products for digital downloads, print materials, office supplies, inks, calculators, computer parts, and everyday essentials.",
};

const catalogImage = "/locale-breeze-general-store-hero.png";

const catalogs = [
  {
    id: "digital-print",
    title: "Digital and Print",
    description:
      "Downloadable calculators, printable guides, templates, study sheets, and bundled print-ready resources.",
    count: "18 sample items",
    imageAlt:
      "Books and notebooks on a bright store counter representing digital and print catalog items",
    imagePosition: "72% 44%",
    examples: ["PDF guides", "Spreadsheets", "Printable planners"],
  },
  {
    id: "books-study",
    title: "Books and Study Tools",
    description:
      "Reference books, notebooks, workbooks, calculators, and practical tools for school, office, and home tasks.",
    count: "16 sample items",
    imageAlt:
      "Books, notebooks, and a calculator arranged as study and office tools",
    imagePosition: "70% 52%",
    examples: ["Books", "Calculators", "Notebooks"],
  },
  {
    id: "ink-writing",
    title: "Ink and Writing",
    description:
      "Ink refills, printer cartridges, everyday pens, markers, paper, and desk writing supplies.",
    count: "14 sample items",
    imageAlt:
      "Ink bottles, pens, and printer cartridges on a store counter",
    imagePosition: "67% 78%",
    examples: ["Ink", "Pens", "Printer supplies"],
  },
  {
    id: "computer-parts",
    title: "Computer Parts",
    description:
      "Common computer add-ons and replacements such as adapters, cables, keyboard parts, fans, and small components.",
    count: "20 sample items",
    imageAlt:
      "Computer cables, adapters, keyboard keys, and a small cooling fan",
    imagePosition: "82% 86%",
    examples: ["Adapters", "Cables", "Keyboard parts"],
  },
];

const products: ProductCardProps[] = [
  {
    name: "Budget Calculator Workbook",
    category: "Digital",
    description:
      "A spreadsheet-style calculator bundle for monthly budgets, simple forecasting, and printable summaries.",
    format: "XLSX + PDF",
    price: "$12.00",
    imageAlt: "Calculator and notebooks representing a budget workbook",
    imagePosition: "72% 65%",
    tags: ["Download", "Printable", "Business"],
  },
  {
    name: "Computer Basics Field Guide",
    category: "Print",
    description:
      "A compact handbook covering everyday ports, cables, adapters, storage, and simple troubleshooting.",
    format: "Booklet",
    price: "$9.50",
    imageAlt: "Books and computer parts representing a computer basics guide",
    imagePosition: "78% 58%",
    tags: ["Reference", "Beginner", "Tech"],
  },
  {
    name: "Everyday Desk Calculator",
    category: "Office",
    description:
      "A reliable calculator sample for school, home office, invoices, receipts, and quick store math.",
    format: "Physical",
    price: "$18.00",
    imageAlt: "A black desk calculator beside books and pens",
    imagePosition: "73% 67%",
    tags: ["Desk", "School", "Office"],
  },
  {
    name: "Refill Ink Starter Pack",
    category: "Print Supply",
    description:
      "Core ink colors for print-heavy work, sample labels, document prep, and everyday refill needs.",
    format: "Physical",
    price: "$22.00",
    imageAlt: "Ink bottles and printer cartridges on a store counter",
    imagePosition: "62% 79%",
    tags: ["Ink", "Print", "Refill"],
  },
  {
    name: "Precision Pen Set",
    category: "Stationery",
    description:
      "Smooth pens for notes, forms, planning, signatures, sketches, and bundled office kits.",
    format: "Physical",
    price: "$7.25",
    imageAlt: "Pens arranged beside notebooks and office supplies",
    imagePosition: "80% 63%",
    tags: ["Writing", "Notes", "Daily use"],
  },
  {
    name: "USB-C Adapter Kit",
    category: "Computer Part",
    description:
      "Common adapters for connecting laptops, monitors, drives, chargers, and small accessories.",
    format: "Physical",
    price: "$16.00",
    imageAlt: "USB cables, adapters, and computer connectors",
    imagePosition: "83% 88%",
    tags: ["USB-C", "Cable", "Adapter"],
  },
  {
    name: "Keyboard Repair Bits",
    category: "Computer Part",
    description:
      "Sample kit for replacing common keys, stabilizers, and small keyboard maintenance pieces.",
    format: "Physical",
    price: "$11.75",
    imageAlt: "Keyboard keys and small computer parts on a desk",
    imagePosition: "87% 92%",
    tags: ["Keyboard", "Repair", "Parts"],
  },
  {
    name: "Printable Study Planner",
    category: "Digital",
    description:
      "A clean weekly planner designed for students, tutors, and anyone organizing repeat study routines.",
    format: "PDF",
    price: "$5.00",
    imageAlt: "Notebooks and paper goods representing a printable study planner",
    imagePosition: "63% 55%",
    tags: ["Download", "Planner", "School"],
  },
];

export default function Products() {
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
                    href={`#${catalog.id}`}
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
                id={catalog.id}
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
                    8
                  </span>
                  Sample products
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
                  <span className="block text-2xl font-bold text-stone-950">
                    4
                  </span>
                  Catalog groups
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
                  <span className="block text-2xl font-bold text-stone-950">
                    2
                  </span>
                  Digital formats
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
