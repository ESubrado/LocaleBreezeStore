"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";
import { motion, useScroll, useTransform } from "framer-motion";
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
  useEffect(() => {
    const scrollRoot = document.documentElement;
    const previousScrollSnapType = scrollRoot.style.scrollSnapType;

    scrollRoot.style.scrollSnapType = "y mandatory";

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
      scrollRoot.style.scrollSnapType = previousScrollSnapType;
    };
  }, []);

  return (
    <main className="fluid-home dark isolate bg-background text-foreground">
      <div
        className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroTechBg.src})` }}
      />
      <div className="fixed inset-0 -z-30 bg-gradient-to-b from-slate-950/40 via-slate-950/75 to-slate-950" />
      <div className="fluid-home-noise" />

      <ViewportSection className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-24 sm:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-blue-500/10 to-transparent" />
        <motion.div className="relative z-10 mx-auto max-w-5xl text-center">
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
      </ViewportSection>

      <ViewportSection
        id="store-focus"
        aria-labelledby="store-focus-heading"
        className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-5 py-24 sm:px-8 lg:py-32"
      >
        <StoreFocusPillars />
      </ViewportSection>

      <ViewportSection
        id="featured-products"
        aria-labelledby="hero-featured-products-heading"
        className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-5 py-20 sm:px-8 lg:py-28"
      >
        <HeroFeaturedProducts products={topProducts} />
      </ViewportSection>

      <ViewportSection className="relative z-20 flex min-h-[100svh] flex-col justify-center py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
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
      </ViewportSection>

      <ViewportSection
        id="store-promise"
        className="relative z-20 flex min-h-[100svh] items-center overflow-hidden border-t border-border bg-black/20 px-5 py-24 backdrop-blur-md sm:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
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
      </ViewportSection>
    </main>
  );
}

function StoreFocusPillars() {
  return (
    <div className="w-full">
      <motion.h2
        id="store-focus-heading"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="mb-12 text-center text-4xl font-bold tracking-normal text-foreground sm:text-5xl"
      >
        Useful finds for every day
      </motion.h2>
      <div className="grid gap-12 lg:grid-cols-3">
        {storePillars.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            className="group relative text-center"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-blue-400 ring-1 ring-white/10 transition-all group-hover:bg-blue-500 group-hover:text-white group-hover:ring-blue-500">
              <pillar.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-2 text-lg font-semibold tracking-normal text-foreground">
              {pillar.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              {pillar.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

type ViewportSectionProps = {
  children: ReactNode;
  className: string;
  id?: string;
  "aria-labelledby"?: string;
};

function ViewportSection({
  children,
  className,
  id,
  "aria-labelledby": ariaLabelledBy,
}: ViewportSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 0.2, 0.72, 1], [80, 0, 0, 0]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.76, 1],
    [0, 1, 1, 0],
  );

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      aria-labelledby={ariaLabelledBy}
      style={{ y, opacity, scrollSnapAlign: "start", scrollSnapStop: "always" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function HeroFeaturedProducts({ products }: { products: HomeProduct[] }) {
  const featuredProductSlides: HomeProduct[][] = [];

  for (let index = 0; index < products.length; index += 2) {
    featuredProductSlides.push(products.slice(index, index + 2));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 64 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="rounded-2xl border border-white/10 bg-slate-950/55 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-md sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-blue-400">
            Handpicked for you
          </p>
          <h2
            id="hero-featured-products-heading"
            className="mt-1 text-2xl font-bold tracking-normal text-foreground"
          >
            Featured products
          </h2>
        </div>
        <Link
          href="/products"
          className="shrink-0 text-sm font-semibold text-slate-300 transition hover:text-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          View all
        </Link>
      </div>

      {featuredProductSlides.length > 0 ? (
        <Carousel aria-label="Featured products" className="w-full">
          <div className="mb-5 flex items-center justify-end gap-2">
            <CarouselPrevious
              aria-label="Show previous featured products"
              className="static size-10 translate-y-0 rounded-full border-white/10 bg-white/5 text-white hover:border-blue-500/40 hover:bg-white/10 hover:text-blue-300"
            />
            <CarouselNext
              aria-label="Show next featured products"
              className="static size-10 translate-y-0 rounded-full border-white/10 bg-white/5 text-white hover:border-blue-500/40 hover:bg-white/10 hover:text-blue-300"
            />
          </div>

          <CarouselContent>
            {featuredProductSlides.map((productPair, index) => (
              <CarouselItem key={productPair[0].id}>
                <motion.div
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{
                    duration: 0.6,
                    delay: index === 0 ? 0.1 : 0,
                    ease: "easeOut",
                  }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  {productPair.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      compact
                      showAddToCart={false}
                      showFeaturedBanner
                      href={`/products/${product.id}`}
                    />
                  ))}
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
          Featured products will appear here soon.
        </p>
      )}
    </motion.div>
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
              viewport={{ once: false, margin: "-80px" }}
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
