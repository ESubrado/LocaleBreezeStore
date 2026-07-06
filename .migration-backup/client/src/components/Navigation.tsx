"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminLoginDropdown from "@/components/AdminLoginDropdown";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export default function Navigation() {
  const pathname = usePathname();
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
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-sans text-base font-semibold text-stone-950 sm:text-lg"
        >
          Locale Breeze Store
        </Link>

        <div
          ref={navListRef}
          className="relative flex items-center gap-1 rounded-full border border-stone-200 bg-white p-1"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-0 rounded-full bg-stone-950 shadow-sm transition-[transform,width,opacity] duration-300 ease-out"
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
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <AdminLoginDropdown />
        </div>
      </div>
    </nav>
  );
}
