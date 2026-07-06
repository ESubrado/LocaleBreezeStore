import Link from "next/link";
import Navigation from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="fluid-home dark isolate flex min-h-[70svh] items-center bg-background px-5 py-20 text-foreground sm:px-8">
        <div className="fixed inset-0 -z-30 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950" />
        <div className="fluid-home-noise" />
        <section className="mx-auto w-full max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-normal text-blue-400">
            Page not found
          </p>
          <h1 className="mt-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-4xl font-bold leading-tight tracking-normal text-transparent sm:text-6xl">
            This shelf is empty.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-slate-400">
            The page or product you are looking for is not available in the
            current catalog.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 hover:bg-blue-400 hover:text-white"
          >
            <Link href="/products">Browse Products</Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
