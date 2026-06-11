import Image from "next/image";
import Navigation from "@/components/Navigation";
import TopProductsCarousel from "@/components/TopProductsCarousel";
import type { ProductCardProps } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
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

const topProducts: ProductCardProps[] = [
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

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="bg-[#f7faf7] text-stone-950">
        <section className="relative isolate flex min-h-[72svh] items-center overflow-hidden">
          <Image
            src="/locale-breeze-general-store-hero.png"
            alt="Books, notebooks, pens, ink, a calculator, cables, adapters, and computer parts arranged on a bright store counter"
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover object-[64%_center]"
          />
          <div className="absolute inset-0 -z-10 bg-white/62" />

          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[#24786b]">
                Everyday essentials, digital and print
              </p>
              <h1 className="text-5xl font-bold leading-tight text-stone-950 sm:text-6xl lg:text-7xl">
                Locale Breeze Store
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-stone-700">
                A flexible neighborhood-style store for digital products, print
                materials, study tools, office supplies, computer basics, and
                useful day-to-day finds.
              </p>             
            </div>
          </div>
        </section>

        <section
          id="store-focus"
          className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-16"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[#24786b]">
              Store focus
            </p>
            <h2 className="mt-3 text-3xl font-bold text-stone-950 sm:text-4xl">
              One store shape for useful products in many formats.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {storePillars.map((pillar) => (
              <Card
                key={pillar.title}
                className="h-full gap-3 rounded-lg border-stone-200 bg-white py-5 shadow-sm"
              >
                <CardHeader className="px-5">
                  <CardTitle className="text-lg text-stone-950">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                  <CardDescription className="text-sm leading-6 text-stone-600">
                    {pillar.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <TopProductsCarousel products={topProducts} />

        <section id="store-promise" className="border-t border-stone-200 bg-white">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-[#b15a2b]">
                Store promise
              </p>
              <h2 className="mt-3 text-3xl font-bold text-stone-950">
                Simple, adaptable, and practical.
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-stone-700">
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
    </>
  );
}
