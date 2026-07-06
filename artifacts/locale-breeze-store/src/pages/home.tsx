import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Download, Package, Layers } from "lucide-react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";
import SupabaseDataDebug from "@/components/SupabaseDataDebug";
import { getFeaturedProducts, type Product } from "@/lib/products";
import heroTechBg from "@/assets/hero-tech-bg.png";
import "@/styles/fluid-theme.css";

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

export default function Home() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    getFeaturedProducts()
      .then((products) => {
        if (!isMounted) return;
        setTopProducts(products);
      })
      .catch((error) => {
        console.error("Failed to load featured products", error);
        if (isMounted) {
          setHasError(true);
        }
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

    let rafId: number;
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

  const heroY = useTransform(springScroll, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(springScroll, [0, 0.2], [1, 0]);
  const orbOneY = useTransform(springScroll, [0, 1], ["0%", "-20%"]);
  const orbTwoY = useTransform(springScroll, [0, 1], ["0%", "-40%"]);

  return (
    <>
      <SupabaseDataDebug
        data={{ topProducts }}
        label="home-page"
        tables={[{ label: "Top products", rows: topProducts }]}
      />
      <Navigation />

      <main
        ref={containerRef}
        className="fluid-home dark isolate bg-background text-foreground"
      >
        <div
          className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${heroTechBg})` }}
        />
        <div className="fixed inset-0 -z-30 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950" />
        <div className="fluid-home-noise" />

        {/* Hero */}
        <section className="isolate relative flex min-h-[88svh] items-center justify-center overflow-hidden px-5 pt-24 sm:px-8">
          <div className="fluid-home-gradient-blur" />
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 mx-auto max-w-5xl text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6 text-sm font-semibold uppercase tracking-widest text-blue-400"
            >
              Everyday essentials, digital and print
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-6xl font-bold leading-tight tracking-tighter text-transparent sm:text-8xl lg:text-9xl"
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
              materials, study tools, office supplies, computer basics, and
              useful day-to-day finds.
            </motion.p>
          </motion.div>

          <motion.div
            style={{ y: orbOneY }}
            className="absolute right-0 top-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-[120px]"
          />
          <motion.div
            style={{ y: orbTwoY }}
            className="absolute bottom-1/4 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]"
          />
        </section>

        {/* Philosophy Ribbon */}
        <section id="store-focus" className="relative z-20 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
          <div className="grid gap-16 lg:grid-cols-3">
            {storePillars.map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-blue-400 ring-1 ring-white/10 transition-all group-hover:bg-blue-500 group-hover:text-white group-hover:ring-blue-500">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Continuous Catalog Stream */}
        <section className="relative z-20 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-7xl px-5 sm:px-8"
          >
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Curated Essentials.
            </h2>
            <p className="mt-4 text-slate-400">
              Customer-ready picks across digital, print, and everyday needs.
            </p>
          </motion.div>

          {isLoading && (
            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 lg:px-16">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="h-64 w-full animate-pulse rounded-3xl bg-white/5 ring-1 ring-white/10"
                />
              ))}
            </div>
          )}

          {!isLoading && hasError && (
            <p className="mx-auto max-w-7xl px-5 text-slate-400 sm:px-8">
              We couldn't load featured products right now. Please try again
              shortly.
            </p>
          )}

          {!isLoading && !hasError && topProducts.length === 0 && (
            <p className="mx-auto max-w-7xl px-5 text-slate-400 sm:px-8">
              No products are available yet.
            </p>
          )}

          {!isLoading && !hasError && topProducts.length > 0 && (
            <div className="flex flex-col gap-8 px-5 sm:px-8 lg:px-16">
              {topProducts.map((product, idx) => (
                <ProductRow key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </section>

        {/* Store Promise / Footer Drift */}
        <section
          id="store-promise"
          className="relative z-20 overflow-hidden border-t border-border bg-black/20 pt-24 pb-16 backdrop-blur-md lg:pt-32"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-5xl lg:text-7xl">
                Simple, adaptable, <br /> and practical.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400">
                Locale Breeze Store is designed to feel clear and useful
                first: easy to understand, ready for both digital and
                physical products, and broad enough for common household,
                school, office, and computer needs.
              </p>
              <Link
                href="/products"
                className="group mt-12 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-8 text-sm font-semibold text-slate-950 transition-all hover:bg-blue-400 hover:text-white"
              >
                Explore the full catalog
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function ProductRow({ product, index }: { product: Product; index: number }) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: index * 0.1 }}
        className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition-all hover:bg-white/10 lg:flex-row lg:items-center"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black lg:w-1/3">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
          <img
            src={product.imageUrl}
            alt={product.imageAlt}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col justify-between p-8 lg:p-12">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                {product.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                {product.format}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground lg:text-3xl">
              {product.name}
            </h3>
            <p className="mt-4 max-w-xl text-slate-400">
              {product.description}
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Price
              </p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {product.price}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-foreground transition-colors group-hover:bg-white group-hover:text-black">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
