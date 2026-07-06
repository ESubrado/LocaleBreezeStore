import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShoppingBag, Search, Menu } from "lucide-react";
import "./Cinematic.css";

const storePillars = [
  {
    title: "Digital & Printable",
    description: "Prepared for downloads, printable resources, templates, and useful files alongside physical goods.",
    number: "01",
  },
  {
    title: "Physical Goods",
    description: "Built to support books, calculators, inks, pens, computer parts, office supplies, and daily essentials.",
    number: "02",
  },
  {
    title: "Room to Grow",
    description: "Flexible enough for new everyday product lines without changing the store's core experience.",
    number: "03",
  },
];

const topProducts = [
  {
    name: "Recycled Paper Notebook Set",
    category: "Office",
    format: "Physical",
    price: "$14.00",
    tags: ["Stationery", "Everyday"],
    description: "A set of three lined notebooks made from recycled paper, ready for notes, planning, or study.",
    image: "/__mockup/images/storefront/cinematic-notebook.png",
  },
  {
    name: "Printable Weekly Planner",
    category: "Digital",
    format: "PDF Download",
    price: "$4.50",
    tags: ["Planning", "Print at home"],
    description: "A clean, printable weekly planner template designed for quick, everyday organization.",
    image: "/__mockup/images/storefront/cinematic-planner.png",
  },
  {
    name: "Canon Printer Ink Cartridge",
    category: "Computer",
    format: "Physical",
    price: "$22.00",
    tags: ["Ink", "Office"],
    description: "Compatible ink cartridge for everyday home and office printing needs.",
    image: "/__mockup/images/storefront/cinematic-ink.png",
  },
  {
    name: "USB-C Multiport Adapter",
    category: "Computer",
    format: "Physical",
    price: "$28.00",
    tags: ["Cables", "Accessories"],
    description: "A compact multiport adapter for connecting everyday peripherals to modern laptops.",
    image: "/__mockup/images/storefront/cinematic-adapter.png",
  },
];

export function Cinematic() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hero Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);

  return (
    <div ref={containerRef} className="cinematic-theme bg-[#0A0E17] text-white min-h-screen selection:bg-blue-500/30 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference px-6 py-6 md:px-12 flex justify-between items-center">
        <span className="font-display font-bold text-xl tracking-tighter text-white">LOCALE<br/>BREEZE</span>
        <div className="hidden md:flex gap-10 font-medium text-sm tracking-wide text-white/70">
          <a href="#" className="text-white hover:text-blue-400 transition-colors">Catalog</a>
          <a href="#" className="hover:text-white transition-colors">Categories</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-white hover:text-blue-400 transition-colors"><Search size={20} strokeWidth={1.5} /></button>
          <button className="text-white hover:text-blue-400 transition-colors"><ShoppingBag size={20} strokeWidth={1.5} /></button>
          <button className="md:hidden text-white"><Menu size={24} strokeWidth={1.5} /></button>
        </div>
      </nav>

      {/* Hero Scene */}
      <section className="relative h-[120vh] -mt-[20vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E17]/50 to-[#0A0E17] z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)] z-10" />
          <img 
            src="/__mockup/images/storefront/cinematic-hero.png" 
            alt="Hero" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 0.2], ["0%", "-50%"]), opacity: heroOpacity }}
          className="relative z-20 text-center px-4 max-w-5xl mx-auto pt-[20vh]"
        >
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-blue-400 font-medium tracking-[0.2em] text-sm md:text-base uppercase mb-8"
          >
            Everyday essentials, digital and print
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-[8rem] font-bold leading-[0.9] tracking-tighter mb-8 glow-text"
          >
            THE NEW<br/>STANDARD.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex justify-center"
          >
            <button className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-medium text-sm hover:bg-blue-500 hover:text-white transition-all duration-300 group">
              EXPLORE CATALOG
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Narrative Scene */}
      <section className="relative min-h-screen py-32 px-6 md:px-12 flex items-center bg-[#0A0E17] z-30">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center"
          >
            <div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                One store shape for useful products in many formats.
              </h2>
              <p className="text-xl text-white/50 leading-relaxed max-w-lg mb-12">
                Locale Breeze Store is designed to feel clear and useful first: easy to understand, ready for both digital and physical products, and broad enough for common household, school, office, and computer needs.
              </p>
              
              <div className="space-y-12">
                {storePillars.map((pillar, i) => (
                  <motion.div 
                    key={pillar.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="text-blue-500/50 font-display text-xl font-bold group-hover:text-blue-400 transition-colors">
                      {pillar.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 font-display">{pillar.title}</h3>
                      <p className="text-white/60 leading-relaxed">{pillar.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative h-[600px] rounded-2xl overflow-hidden border border-white/5 glow-effect hidden lg:block">
              <img 
                src="/__mockup/images/storefront/cinematic-notebook.png" 
                alt="Notebooks" 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent opacity-80" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Catalog Preview Scene */}
      <section className="relative py-32 bg-[#06090F] z-30 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
          >
            <div>
              <p className="text-blue-400 tracking-widest text-sm uppercase mb-4 font-medium">Top Products</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold max-w-2xl">
                Customer-ready picks across digital, print, and everyday needs.
              </h2>
            </div>
            <button className="flex items-center gap-2 border-b border-white/20 pb-2 hover:border-blue-400 hover:text-blue-400 transition-colors text-sm uppercase tracking-wider font-medium">
              View All <ArrowRight size={16} />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topProducts.map((product, i) => (
              <motion.div 
                key={product.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-[#0A0E17] rounded-lg border border-white/5">
                  <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                    <span className="bg-blue-500/20 text-blue-300 backdrop-blur-md px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded-sm">
                      {product.category}
                    </span>
                  </div>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent opacity-60" />
                </div>
                
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-lg font-bold group-hover:text-blue-400 transition-colors leading-tight pr-4">
                      {product.name}
                    </h3>
                    <span className="text-white/80 font-medium">{product.price}</span>
                  </div>
                  <p className="text-sm text-white/50 mb-4 line-clamp-2">{product.description}</p>
                  <p className="text-xs text-white/30 uppercase tracking-wider">{product.format}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Outro */}
      <footer className="relative py-20 bg-[#0A0E17] border-t border-white/10 z-30">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <span className="font-display font-bold text-2xl tracking-tighter text-white">LOCALE BREEZE</span>
            <p className="text-white/40 text-sm mt-2 max-w-xs">
              Practical digital, print, office, and computer essentials for a flexible everyday catalog.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-blue-400 transition-colors">Catalog</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Search</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
