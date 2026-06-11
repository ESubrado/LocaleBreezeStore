"use client";

import { useRef } from "react";
import Link from "next/link";
import ProductCard, { type ProductCardProps } from "@/components/ProductCard";

type TopProductsCarouselProps = {
  products: ProductCardProps[];
};

export default function TopProductsCarousel({
  products,
}: TopProductsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "previous" | "next") => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const card = carousel.querySelector<HTMLElement>("[data-carousel-card]");
    const distance = card ? card.offsetWidth + 20 : carousel.clientWidth * 0.85;

    carousel.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-labelledby="top-products-heading"
      className="border-y border-stone-200 bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[#b15a2b]">
              Top products
            </p>
            <h2
              id="top-products-heading"
              className="mt-3 text-2xl font-bold text-stone-950 sm:text-3xl"
            >
              Customer-ready picks across digital, print, and everyday needs.
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-950 transition hover:border-[#24786b] hover:text-[#24786b] focus:outline-none focus:ring-2 focus:ring-[#24786b] focus:ring-offset-2"
            >
              View catalog
            </Link>
            <div className="flex gap-2" aria-label="Carousel controls">
              <button
                type="button"
                aria-label="Show previous top products"
                onClick={() => scroll("previous")}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-lg font-bold text-stone-950 transition hover:border-[#24786b] hover:text-[#24786b] focus:outline-none focus:ring-2 focus:ring-[#24786b] focus:ring-offset-2"
              >
                <span aria-hidden="true">&lt;</span>
              </button>
              <button
                type="button"
                aria-label="Show next top products"
                onClick={() => scroll("next")}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-lg font-bold text-stone-950 transition hover:border-[#24786b] hover:text-[#24786b] focus:outline-none focus:ring-2 focus:ring-[#24786b] focus:ring-offset-2"
              >
                <span aria-hidden="true">&gt;</span>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={carouselRef}
          tabIndex={0}
          aria-label="Top product carousel"
          className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 focus:outline-none focus:ring-2 focus:ring-[#24786b] focus:ring-offset-4"
        >
          {products.map((product) => (
            <div
              key={product.name}
              data-carousel-card
              className="w-[68vw] max-w-[18rem] shrink-0 snap-start sm:w-[18rem] lg:w-[16rem]"
            >
              <ProductCard {...product} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
