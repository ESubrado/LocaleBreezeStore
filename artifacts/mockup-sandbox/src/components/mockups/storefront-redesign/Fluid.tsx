import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, ShoppingBag, Download, Package, Layers } from "lucide-react";
import "./_fluid.css";

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

export function Fluid() {
  const containerRef = useRef<HTMLDivElement>(null);

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

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
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

  return (
    <div ref={containerRef} className="fluid-mockup relative overflow-hidden text-slate-100">
      <div className="fluid-mockup-noise" />
      <div className="fluid-gradient-blur" />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 mix-blend-difference"
      >
        <div className="text-xl font-bold tracking-tight text-white">LBS.</div>
        <div className="flex items-center gap-8 text-sm font-medium">
          <a href="#" className="hover:text-blue-400 transition-colors">Catalog</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Collections</a>
          <a href="#" className="hover:text-blue-400 transition-colors">About</a>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 hover:bg-blue-400 hover:text-white transition-colors">
          <ShoppingBag className="h-4 w-4" />
        </button>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center pt-24 px-8">
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
            className="text-6xl font-bold leading-tight tracking-tighter sm:text-8xl lg:text-9xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40"
          >
            Locale Breeze
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-8 max-w-2xl text-lg font-light leading-relaxed text-slate-400"
          >
            A flexible neighborhood-style store for digital products, print materials, study tools, office supplies, computer basics, and useful day-to-day finds.
          </motion.p>
        </motion.div>
        
        {/* Abstract shapes/images moving slightly */}
        <motion.div 
          style={{ y: useTransform(springScroll, [0, 1], ["0%", "-20%"]) }}
          className="absolute right-0 top-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-[120px]"
        />
        <motion.div 
          style={{ y: useTransform(springScroll, [0, 1], ["0%", "-40%"]) }}
          className="absolute left-10 bottom-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]"
        />
      </section>

      {/* Philosophy Ribbon */}
      <section className="relative z-20 mx-auto max-w-7xl px-8 py-32">
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
              <h3 className="mb-4 text-xl font-semibold tracking-tight text-white">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Continuous Catalog Stream */}
      <section className="relative z-20 py-32">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mb-20 max-w-7xl px-8"
        >
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Curated Essentials.</h2>
          <p className="mt-4 text-slate-400">Customer-ready picks across digital, print, and everyday needs.</p>
        </motion.div>

        <div className="flex flex-col gap-8 px-8 md:px-16 lg:px-24">
          {topProducts.map((product, idx) => (
            <ProductRow key={product.name} product={product} index={idx} />
          ))}
        </div>
      </section>

      {/* Footer Drift */}
      <section className="relative z-20 overflow-hidden border-t border-white/5 bg-black/20 pt-32 pb-16 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl lg:text-7xl">
              Simple, adaptable, <br/> and practical.
            </h2>
            <button className="mt-12 group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-8 text-sm font-semibold text-slate-950 transition-all hover:bg-blue-400 hover:text-white">
              Explore the full catalog
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          <div className="mt-32 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-sm text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Locale Breeze Store.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductRow({ product, index }: { product: typeof topProducts[0], index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition-all hover:bg-white/10 lg:flex-row lg:items-center"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black lg:w-1/3">
        {/* Placeholder for real product image, using our fluid-hero for now or just a gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Package className="h-24 w-24 text-white" />
        </div>
        <img 
          src="/__mockup/images/storefront/fluid-hero.jpg" 
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-overlay transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80"
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
          <h3 className="text-2xl font-bold text-white lg:text-3xl">{product.name}</h3>
          <p className="mt-4 max-w-xl text-slate-400">{product.description}</p>
        </div>
        
        <div className="mt-8 flex items-end justify-between border-t border-white/10 pt-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Price</p>
            <p className="mt-1 text-2xl font-semibold text-white">{product.price}</p>
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
