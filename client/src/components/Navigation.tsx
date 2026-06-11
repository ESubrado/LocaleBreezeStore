"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ExclusiveLoginDropdown from "@/components/ExclusiveLoginDropdown";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-sans text-base font-semibold text-stone-950 sm:text-lg"
        >
          Locale Breeze Store
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-white p-1">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-stone-950 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <ExclusiveLoginDropdown />
        </div>
      </div>
    </nav>
  );
}
