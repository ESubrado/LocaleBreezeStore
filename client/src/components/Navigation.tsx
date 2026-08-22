"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Menu, ShoppingCart } from "lucide-react";
import AdminLoginDropdown from "@/components/AdminLoginDropdown";
import { useCart } from "@/components/CartProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export default function Navigation() {
  const pathname = usePathname();
  const { itemCount, isReady } = useCart();
  const navListRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePill, setActivePill] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const updateActivePill = useCallback(() => {
    const navList = navListRef.current;
    const activeHref = links.find((link) =>
      isActivePath(pathname, link.href),
    )?.href;
    const activeLink = activeHref ? linkRefs.current[activeHref] : null;

    if (!navList || !activeLink) {
      setActivePill((current) => ({ ...current, opacity: 0 }));
      return;
    }

    const navListRect = navList.getBoundingClientRect();
    const activeLinkRect = activeLink.getBoundingClientRect();

    setActivePill({
      left: activeLinkRect.left - navListRect.left,
      width: activeLinkRect.width,
      opacity: 1,
    });
  }, [pathname]);

  useEffect(() => {
    updateActivePill();

    window.addEventListener("resize", updateActivePill);

    const navList = navListRef.current;
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateActivePill);

    if (navList && resizeObserver) {
      resizeObserver.observe(navList);
    }

    return () => {
      window.removeEventListener("resize", updateActivePill);
      resizeObserver?.disconnect();
    };
  }, [updateActivePill]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="contents lg:flex lg:min-w-0 lg:items-center lg:gap-2">
          <Link
            href="/"
            className="min-w-0 truncate font-sans text-base font-semibold tracking-normal text-white sm:text-lg"
          >
            Locale Breeze Store
          </Link>
          <Link
            href="/cart"
            aria-current={isActivePath(pathname, "/cart") ? "page" : undefined}
            aria-label={
              isReady
                ? `${itemCount} item${itemCount === 1 ? "" : "s"} in cart`
                : "Loading cart"
            }
            className={`ml-auto mr-1 inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-1 rounded-md px-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden ${
              isActivePath(pathname, "/cart")
                ? "bg-blue-600 text-white"
                : "text-slate-200 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            <span aria-hidden="true">{isReady ? itemCount : "..."}</span>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-md text-slate-200 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
          aria-controls="mobile-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          <AnimatePresence initial={false} mode="wait">
            {isMobileMenuOpen ? (
              <motion.span
                key="menu-open"
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                transition={{ duration: 0.16 }}
                className="inline-flex"
              >
                <ArrowDown className="size-5" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="menu-closed"
                initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                transition={{ duration: 0.16 }}
                className="inline-flex"
              >
                <Menu className="size-5" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div
          ref={navListRef}
          className="relative hidden items-center gap-1 rounded-md border border-slate-800 bg-slate-900 p-1 lg:flex"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-0 rounded-sm bg-blue-600 transition-[transform,width,opacity] duration-300 ease-out"
            style={{
              opacity: activePill.opacity,
              transform: `translateX(${activePill.left}px)`,
              width: activePill.width,
            }}
          />
          {links.map((link) => {
            const isActive = isActivePath(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(node) => {
                  linkRefs.current[link.href] = node;
                }}
                aria-current={isActive ? "page" : undefined}
                className={`relative z-10 inline-flex items-center gap-1 rounded-sm px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.href === "/cart" ? (
                  <>
                    <ShoppingCart className="size-4" aria-hidden="true" />
                    Cart
                    <span
                      aria-label={
                        isReady
                          ? `${itemCount} item${itemCount === 1 ? "" : "s"} in cart`
                          : "Loading cart"
                      }
                      className="inline-flex min-w-5 items-center justify-center rounded-full bg-slate-950/40 px-1.5 py-0.5 text-[11px] font-bold text-white"
                    >
                      {isReady ? itemCount : "..."}
                    </span>
                  </>
                ) : (
                  link.label
                )}
              </Link>
            );
          })}
          <AdminLoginDropdown />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isMobileMenuOpen ? (
          <motion.div
            id="mobile-navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-50 overflow-hidden shadow-2xl shadow-slate-950/50 lg:hidden"
          >
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="border-t border-slate-800 bg-slate-950 px-5 py-3 sm:px-8"
            >
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 rounded-md border border-slate-800 bg-slate-900 p-1">
                {links
                  .filter((link) => link.href !== "/cart")
                  .map((link) => {
                  const isActive = isActivePath(pathname, link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                  })}
                <div className="flex flex-col gap-1 [&>a]:inline-flex [&>a]:min-h-11 [&>a]:w-full [&>a]:items-center [&>a]:justify-start [&>button]:inline-flex [&>button]:min-h-11 [&>button]:w-full [&>button]:items-center [&>button]:justify-start [&>button]:text-left [&>div]:w-full [&>div>button]:inline-flex [&>div>button]:min-h-11 [&>div>button]:w-full [&>div>button]:items-center [&>div>button]:justify-start [&>div>button]:text-left">
                  <AdminLoginDropdown />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
