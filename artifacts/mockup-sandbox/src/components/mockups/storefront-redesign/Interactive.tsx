import React, { useEffect, useRef, MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Box, Cpu, FileDown, Layers, Search, ShoppingBag } from "lucide-react";
import "./Interactive.css";

gsap.registerPlugin(ScrollTrigger);

const storePillars = [
  {
    title: "Digital & Printable",
    description: "Prepared for downloads, printable resources, templates, and useful files alongside physical goods.",
    icon: <FileDown className="h-6 w-6 text-blue-400" />
  },
  {
    title: "Practical Physical Goods",
    description: "Built to support books, calculators, inks, pens, computer parts, office supplies, and daily essentials.",
    icon: <Box className="h-6 w-6 text-blue-400" />
  },
  {
    title: "Room to Grow",
    description: "Flexible enough for new everyday product lines without changing the store's core experience.",
    icon: <Layers className="h-6 w-6 text-blue-400" />
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
    image: "/__mockup/images/storefront/hero.png"
  },
  {
    name: "Printable Weekly Planner",
    category: "Digital",
    format: "PDF Download",
    price: "$4.50",
    tags: ["Planning", "Print at home"],
    description: "A clean, printable weekly planner template designed for quick, everyday organization.",
    image: "/__mockup/images/storefront/hero.png"
  },
  {
    name: "Canon Printer Ink Cartridge",
    category: "Computer",
    format: "Physical",
    price: "$22.00",
    tags: ["Ink", "Office"],
    description: "Compatible ink cartridge for everyday home and office printing needs.",
    image: "/__mockup/images/storefront/hero.png"
  },
  {
    name: "USB-C Multiport Adapter",
    category: "Computer",
    format: "Physical",
    price: "$28.00",
    tags: ["Cables", "Accessories"],
    description: "A compact multiport adapter for connecting everyday peripherals to modern laptops.",
    image: "/__mockup/images/storefront/hero.png"
  },
];

export function Interactive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const items = itemsRef.current.filter(Boolean);
    
    // Initial entrance animation
    gsap.fromTo(items, 
      { y: 100, opacity: 0, rotateX: 10 },
      { 
        y: 0, 
        opacity: 1, 
        rotateX: 0,
        duration: 1, 
        stagger: 0.1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );

    // Setup 3D tilt effect on hover for bento items
    items.forEach((item) => {
      if (!item) return;
      
      const handleMouseMove = (e: globalThis.MouseEvent) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update custom properties for radial gradient glow
        item.style.setProperty('--mouse-x', `${x}px`);
        item.style.setProperty('--mouse-y', `${y}px`);
        
        // Calculate tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;
        
        gsap.to(item, {
          rotateX,
          rotateY,
          duration: 0.5,
          ease: "power2.out",
          transformPerspective: 1000
        });
      };
      
      const handleMouseLeave = () => {
        gsap.to(item, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      };
      
      item.addEventListener("mousemove", handleMouseMove);
      item.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        item.removeEventListener("mousemove", handleMouseMove);
        item.removeEventListener("mouseleave", handleMouseLeave);
      };
    });
  }, []);

  // Magnetic button effect
  const handleMagneticMove = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
    
    gsap.to(btn, { x, y, duration: 0.3, ease: "power2.out" });
  };
  
  const handleMagneticLeave = (e: MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <div className="interactive-mockup">
      {/* Navigation */}
      <nav className="nav-glass sticky top-0 z-50 w-full px-6 py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Locale Breeze</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Digital</a>
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Physical</a>
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Collections</a>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-300 hover:text-white transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-300 hover:text-white transition-colors">
              <ShoppingBag className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main ref={containerRef} className="pb-24">
        <div className="bento-grid">
          
          {/* Hero Section */}
          <div 
            ref={el => { itemsRef.current[0] = el; }}
            className="bento-item bento-hero"
          >
            <div className="bento-content max-w-4xl flex flex-col items-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-900/50 bg-blue-950/30 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Everyday essentials, reimagined
              </div>
              
              <h1 className="text-gradient mb-8 text-6xl font-bold tracking-tight md:text-8xl lg:text-9xl">
                Locale Breeze.
              </h1>
              
              <p className="mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
                A flexible neighborhood-style store for digital products, print
                materials, study tools, office supplies, and useful day-to-day finds.
              </p>
              
              <button 
                className="magnetic-btn"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                Explore Catalog <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Featured Product */}
          <div 
            ref={el => { itemsRef.current[1] = el; }}
            className="bento-item bento-main-product"
          >
            <div className="bento-content flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="tag tag-physical">{topProducts[0].format}</span>
                  <span className="tag tag-category">{topProducts[0].category}</span>
                </div>
                <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md text-white">
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>
              
              <div className="product-image-container flex-grow mb-6 mt-2 h-auto" style={{ minHeight: '200px' }}>
                <img src={topProducts[0].image} alt={topProducts[0].name} className="object-cover" />
              </div>
              
              <div className="mt-auto">
                <h3 className="text-2xl font-bold text-white mb-2">{topProducts[0].name}</h3>
                <p className="text-slate-400 mb-4 line-clamp-2">{topProducts[0].description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-light text-white">{topProducts[0].price}</span>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Products */}
          {topProducts.slice(1, 3).map((product, idx) => (
            <div 
              key={product.name}
              ref={el => { itemsRef.current[idx + 2] = el; }}
              className="bento-item bento-side-product"
            >
              <div className="bento-content flex flex-col justify-between h-full">
                <div className="flex gap-2 mb-4">
                  <span className={`tag ${product.format.includes('Physical') ? 'tag-physical' : 'tag-digital'}`}>
                    {product.format}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-sm text-slate-400 mb-4 flex-grow">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-medium text-white">{product.price}</span>
                  <button className="p-2 rounded-full border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-colors text-white">
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pillars */}
          <div 
            ref={el => { itemsRef.current[4] = el; }}
            className="bento-item bento-wide"
          >
            <div className="bento-content w-full">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">One store shape.</h2>
                <p className="text-slate-400">For useful products in many formats.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {storePillars.map((pillar, idx) => (
                  <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="h-10 w-10 rounded-lg bg-blue-900/30 flex items-center justify-center mb-2">
                      {pillar.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom Call to Action */}
          <div 
            ref={el => { itemsRef.current[5] = el; }}
            className="bento-item bento-hero"
            style={{ minHeight: '40vh', gridColumn: 'span 12' }}
          >
            <div className="bento-content flex flex-col items-center text-center justify-center h-full">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple, adaptable, and practical.</h2>
              <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg">
                Whether the item is a downloadable file, a printed resource, a pen, a bottle of ink, or a small computer part, the store keeps the presentation grounded in practical everyday use.
              </p>
              <button 
                className="magnetic-btn border border-slate-700 bg-transparent text-white hover:bg-slate-800"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                View full catalog
              </button>
            </div>
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
              <ShoppingBag className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-white">Locale Breeze</span>
          </div>
          <p className="text-sm text-slate-500">© 2024 Locale Breeze Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
