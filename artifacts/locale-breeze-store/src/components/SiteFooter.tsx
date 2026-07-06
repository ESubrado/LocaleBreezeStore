import { Link } from "wouter";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/"
            className="text-base font-semibold text-white transition hover:text-blue-400"
          >
            Locale Breeze Store
          </Link>
          <p className="mt-2 max-w-xl text-sm leading-6">
            Practical digital, print, office, and computer essentials for a
            flexible everyday catalog.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="text-sm font-medium transition hover:text-blue-400"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium transition hover:text-blue-400"
          >
            Products
          </Link>
        </nav>
      </div>
    </footer>
  );
}
