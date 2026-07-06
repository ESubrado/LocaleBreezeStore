import { useRef, useState } from "react";
import "./_group.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

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

const topProducts = [
  {
    name: "Recycled Paper Notebook Set",
    category: "Office",
    format: "Physical",
    price: "$14.00",
    tags: ["Stationery", "Everyday"],
    description:
      "A set of three lined notebooks made from recycled paper, ready for notes, planning, or study.",
  },
  {
    name: "Printable Weekly Planner",
    category: "Digital",
    format: "PDF Download",
    price: "$4.50",
    tags: ["Planning", "Print at home"],
    description:
      "A clean, printable weekly planner template designed for quick, everyday organization.",
  },
  {
    name: "Canon Printer Ink Cartridge",
    category: "Computer",
    format: "Physical",
    price: "$22.00",
    tags: ["Ink", "Office"],
    description:
      "Compatible ink cartridge for everyday home and office printing needs.",
  },
  {
    name: "USB-C Multiport Adapter",
    category: "Computer",
    format: "Physical",
    price: "$28.00",
    tags: ["Cables", "Accessories"],
    description:
      "A compact multiport adapter for connecting everyday peripherals to modern laptops.",
  },
];

function ProductCard({ product }: { product: (typeof topProducts)[number] }) {
  return (
    <div className="flex h-full min-w-[16rem] flex-1 flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/9] bg-muted">
        <img
          src="/__mockup/images/storefront/hero.png"
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-sm bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            {product.category}
          </span>
          <span className="rounded-sm bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {product.format}
          </span>
        </div>
        <h3 className="mt-3 text-base font-semibold leading-5 text-foreground">
          {product.name}
        </h3>
        <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-muted-foreground">Sample</span>
          <span className="text-base font-bold text-foreground">{product.price}</span>
        </div>
      </div>
    </div>
  );
}

export function Current() {
  const navListRef = useRef<HTMLDivElement>(null);
  const [pathname] = useState("/");

  return (
    <div className="font-app-sans min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <span className="font-sans text-base font-semibold tracking-tight text-white sm:text-lg">
            Locale Breeze Store
          </span>
          <div
            ref={navListRef}
            className="relative flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 p-1"
          >
            {links.map((link) => (
              <span
                key={link.href}
                className={`relative z-10 rounded-sm px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  link.href === pathname
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </span>
            ))}
            <button className="rounded-sm px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
              Login
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative isolate flex min-h-[72vh] items-center overflow-hidden bg-slate-950">
          <img
            src="/__mockup/images/storefront/hero.png"
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

        <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">
              Store focus
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              One store shape for useful products in many formats.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {storePillars.map((pillar) => (
              <div
                key={pillar.title}
                className="h-full rounded-md border border-border bg-card p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-primary">
                  Top products
                </p>
                <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
                  Customer-ready picks across digital, print, and everyday needs.
                </h2>
              </div>
              <button className="h-11 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
                View catalog
              </button>
            </div>
            <div className="mt-6 flex gap-5 overflow-x-auto pb-3">
              {topProducts.map((product) => (
                <div key={product.name} className="w-64 shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card">
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

      <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-base font-semibold text-white">Locale Breeze Store</span>
            <p className="mt-2 max-w-xl text-sm leading-6">
              Practical digital, print, office, and computer essentials for a
              flexible everyday catalog.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4">
            <span className="text-sm font-medium hover:text-blue-400">Home</span>
            <span className="text-sm font-medium hover:text-blue-400">Products</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
