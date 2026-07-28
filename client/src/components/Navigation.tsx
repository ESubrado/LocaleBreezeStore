"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
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

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-sans text-base font-semibold tracking-normal text-white sm:text-lg"
        >
          Locale Breeze Store
        </Link>

        <div
          ref={navListRef}
          className="relative flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 p-1"
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
    </nav>
  );
}
