"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Download, Layers, Package } from "lucide-react";
import heroTechBg from "@/app/assets/hero-tech-bg.png";
import ProductCard, { type ProductCardProps } from "@/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";

type HomeProduct = ProductCardProps & {
  id: number;
};

type HomeFluidExperienceProps = {
  topProducts: HomeProduct[];
};

const storePillars = [
  {
    icon: Download,
    title: "Digital and printable",
    description:
      "Prepared for downloads, printable resources, templates, and useful files alongside physical goods.",
  },
  {
    icon: Package,
    title: "Practical physical goods",
    description:
      "Built to support books, calculators, inks, pens, computer parts, office supplies, and daily essentials.",
  },
  {
    icon: Layers,
    title: "Room to grow",
    description:
      "Flexible enough for new everyday product lines without changing the store's core experience.",
  },
];

export default function HomeFluidExperience({
  topProducts,
}: HomeFluidExperienceProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const springScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const heroY = useTransform(springScroll, [0, 1], ["0%", "42%"]);
  const heroOpacity = useTransform(springScroll, [0, 0.22], [1, 0]);

  return (
    <main
      ref={containerRef}
      className="fluid-home dark isolate bg-background text-foreground"
    >
      <div
        className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroTechBg.src})` }}
      />
      <div className="fixed inset-0 -z-30 bg-gradient-to-b from-slate-950/40 via-slate-950/75 to-slate-950" />
      <div className="fluid-home-noise" />

      <section className="relative isolate flex min-h-[88svh] items-center justify-center overflow-hidden px-5 pt-24 sm:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-blue-500/10 to-transparent" />
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 text-sm font-semibold uppercase tracking-normal text-blue-400"
          >
            Everyday essentials, digital and print
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-6xl font-bold leading-tight tracking-normal text-transparent sm:text-8xl lg:text-9xl"
          >
            Locale Breeze
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-8 max-w-2xl text-lg font-light leading-relaxed text-slate-400"
          >
            A flexible neighborhood-style store for digital products, print
            materials, study tools, office supplies, computer basics, and useful
            day-to-day finds.
          </motion.p>
        </motion.div>
      </section>

      <section
        id="store-focus"
        className="relative z-20 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32"
      >
        <div className="grid gap-16 lg:grid-cols-3">
          {storePillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-blue-400 ring-1 ring-white/10 transition-all group-hover:bg-blue-500 group-hover:text-white group-hover:ring-blue-500">
                <pillar.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-4 text-xl font-semibold tracking-normal text-foreground">
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-20 py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-7xl px-5 sm:px-8"
        >
          <h2 className="text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
            Curated Essentials.
          </h2>
          <p className="mt-4 text-slate-400">
            Customer-ready picks across digital, print, and everyday needs.
          </p>
        </motion.div>

        {topProducts.length > 0 ? (
          <ProductCarousel products={topProducts} />
        ) : (
          <p className="mx-auto max-w-7xl px-5 text-slate-400 sm:px-8">
            No products are available yet.
          </p>
        )}
      </section>

      <section
        id="store-promise"
        className="relative z-20 overflow-hidden border-t border-border bg-black/20 pb-16 pt-24 backdrop-blur-md lg:pt-32"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <h2 className="text-3xl font-bold tracking-normal text-foreground sm:text-5xl lg:text-7xl">
              Simple, adaptable,
              <br />
              and practical.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400">
              Locale Breeze Store is designed to feel clear and useful first:
              easy to understand, ready for both digital and physical products,
              and broad enough for common household, school, office, and
              computer needs.
            </p>
            <Link
              href="/products"
              className="group mt-12 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-8 text-sm font-semibold text-slate-950 transition-all hover:bg-blue-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Explore the full catalog
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function ProductCarousel({ products }: { products: HomeProduct[] }) {
  return (
    <Carousel
      aria-label="Curated essentials"
      className="mx-auto w-full max-w-7xl px-5 sm:px-8"
    >
      <AutoAdvanceProductCarousel enabled={products.length > 1} />

      <div className="mb-6 flex items-center justify-end gap-2">
        <CarouselPrevious
          aria-label="Show previous curated essential"
          className="static size-11 translate-y-0 rounded-full border-white/10 bg-white/5 text-white hover:border-blue-500/40 hover:bg-white/10 hover:text-blue-300"
        />
        <CarouselNext
          aria-label="Show next curated essential"
          className="static size-11 translate-y-0 rounded-full border-white/10 bg-white/5 text-white hover:border-blue-500/40 hover:bg-white/10 hover:text-blue-300"
        />
      </div>

      <CarouselContent className="-ml-5 pb-4">
        {products.map((product, index) => (
          <CarouselItem
            key={product.id}
            className="basis-[82vw] pl-5 sm:basis-[22rem] lg:basis-[24rem]"
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: index * 0.08 }}
              className="h-full"
            >
              <ProductCard
                {...product}
                compact
                showAddToCart={false}
                href={`/products/${product.id}`}
              />
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

function AutoAdvanceProductCarousel({ enabled }: { enabled: boolean }) {
  const { canScrollNext, scrollNext, viewportRef } = useCarousel();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const viewport = viewportRef.current;

      if (!viewport) {
        return;
      }

      if (canScrollNext) {
        scrollNext();
        return;
      }

      viewport.scrollTo({
        behavior: "smooth",
        left: 0,
      });
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canScrollNext, enabled, scrollNext, viewportRef]);

  return null;
}
