import { Link } from "wouter";
import ProductCard, { type ProductCardProps } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type TopProductsCarouselProps = {
  products: ProductCardProps[];
};

export default function TopProductsCarousel({
  products,
}: TopProductsCarouselProps) {
  return (
    <section
      aria-labelledby="top-products-heading"
      className="border-y border-stone-200 bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        <Carousel aria-labelledby="top-products-heading">
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
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 rounded-full border-stone-300 bg-white px-4 text-stone-950 hover:border-[#24786b] hover:text-[#24786b]"
              >
                <Link href="/products">View catalog</Link>
              </Button>
              <div className="flex gap-2" aria-label="Carousel controls">
                <CarouselPrevious
                  aria-label="Show previous top products"
                  className="static size-11 translate-y-0 rounded-full border-stone-300 bg-white text-stone-950 hover:border-[#24786b] hover:text-[#24786b]"
                />
                <CarouselNext
                  aria-label="Show next top products"
                  className="static size-11 translate-y-0 rounded-full border-stone-300 bg-white text-stone-950 hover:border-[#24786b] hover:text-[#24786b]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <CarouselContent className="-ml-5 pb-3">
              {products.map((product) => (
                <CarouselItem
                  key={product.name}
                  className="basis-[68vw] snap-start pl-5 sm:basis-[18rem] lg:basis-[16rem]"
                >
                  <ProductCard {...product} compact />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
