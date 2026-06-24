import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white text-stone-700">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/"
            className="text-base font-semibold text-stone-950 transition hover:text-[#24786b]"
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
            className="text-sm font-medium transition hover:text-[#24786b]"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium transition hover:text-[#24786b]"
          >
            Products
          </Link>
        </nav>
      </div>
    </footer>
  );
}
