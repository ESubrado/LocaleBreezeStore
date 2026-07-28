import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
} from "lucide-react";
import {
  getProductById,
  getProductCatalogPageData,
  type Product,
} from "@/lib/products";
import productDetailTechBg from "@/app/assets/product-detail-tech-bg.png";
import MotionReveal from "@/components/MotionReveal";
import AddToCartButton from "@/components/AddToCartButton";
import InventoryStatus from "@/components/InventoryStatus";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const fallbackProductImage = "/locale-breeze-general-store-hero.png";

function getRelatedProducts(product: Product, products: Product[]) {
  const sharedTags = new Set(product.tags);
  const rankedProducts = products
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      product: candidate,
      score:
        (candidate.category === product.category ? 2 : 0) +
        candidate.tags.filter((tag) => sharedTags.has(tag)).length,
    }))
    .sort((a, b) => b.score - a.score);

  return rankedProducts
    .filter(({ score }) => score > 0)
    .concat(rankedProducts.filter(({ score }) => score === 0))
    .slice(0, 3)
    .map(({ product }) => product);
}

export default async function ProductItemPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const [{ products }, product] = await Promise.all([
    getProductCatalogPageData(),
    getProductById(productId),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product, products);
  const productImages =
    product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl || fallbackProductImage];
  const FormatIcon = product.format === "Physical" ? PackageCheck : FileText;
  const fulfillmentText =
    product.format === "Physical"
      ? "Shelf-ready physical sample"
      : "Prepared as a download sample";

  const details = [
    { label: "Product ID", value: String(product.id) },
    { label: "Price", value: product.price },
    { label: "Category", value: product.category },
    { label: "Format", value: product.format },
    { label: "Catalog status", value: "Sample item" },
  ];

  return (
    <>
      <Navigation />

      <main className="fluid-home dark isolate bg-background text-foreground">
        <div
          className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${productDetailTechBg.src})` }}
        />
        <div className="fixed inset-0 -z-30 bg-gradient-to-b from-slate-950/40 via-slate-950/75 to-slate-950" />
        <div className="fluid-home-noise" />

        <section className="relative overflow-hidden px-5 pb-16 pt-24 sm:px-8 lg:pb-24">
          <div className="fluid-home-gradient-blur" />
          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <MotionReveal>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-11 rounded-full px-0 text-slate-300 hover:bg-transparent hover:text-blue-400"
              >
                <Link href="/products">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Products
                </Link>
              </Button>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {product.category}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  {product.format}
                </span>
              </div>

              <h1 className="mt-5 bg-gradient-to-b from-white to-white/40 bg-clip-text text-4xl font-bold leading-tight tracking-normal text-transparent sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
                {product.description}
              </p>
              <InventoryStatus
                quantity={product.quantity}
                lowStockThreshold={product.lowStockThreshold}
                className="mt-4"
              />

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <AddToCartButton
                  id={product.id}
                  name={product.name}
                  priceAmount={product.priceAmount}
                  currency={product.currency}
                  imageUrl={product.imageUrl}
                  imageAlt={product.imageAlt}
                  quantity={product.quantity}
                  lowStockThreshold={product.lowStockThreshold}
                />
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 hover:bg-blue-400 hover:text-white"
                >
                  <Link href="/products#samples-heading">
                    <ShoppingBag className="size-4" aria-hidden="true" />
                    Browse Samples
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-white/10 bg-white/5 px-6 text-sm font-semibold text-slate-300 hover:border-blue-500/40 hover:bg-white/10 hover:text-white"
                >
                  <Link href="/products">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back To Catalog
                  </Link>
                </Button>
              </div>
            </MotionReveal>

            <MotionReveal
              delay={0.15}
              className="relative overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10"
            >
              <Carousel aria-label={`${product.name} images`}>
                <CarouselContent className="ml-0">
                  {productImages.map((imageUrl, index) => (
                    <CarouselItem key={imageUrl} className="basis-full pl-0">
                      <div className="relative min-h-80 overflow-hidden bg-black sm:min-h-[31rem]">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                        <Image
                          src={imageUrl}
                          alt={
                            index === 0
                              ? product.imageAlt
                              : `${product.imageAlt} ${index + 1}`
                          }
                          fill
                          priority={index === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          style={{
                            objectPosition: product.imagePosition ?? "center",
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 size-10 border-white/10 bg-black/60 text-white shadow-sm backdrop-blur hover:border-blue-500/40 hover:bg-black/80 hover:text-blue-300" />
                <CarouselNext className="right-4 size-10 border-white/10 bg-black/60 text-white shadow-sm backdrop-blur hover:border-blue-500/40 hover:bg-black/80 hover:text-blue-300" />
              </Carousel>
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                <span className="block text-xs font-semibold uppercase tracking-normal text-slate-400">
                  Sample price
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {product.price}
                </span>
              </div>
            </MotionReveal>
          </div>
        </section>

        <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:py-24">
          <MotionReveal className="h-fit rounded-lg bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="text-xl font-semibold tracking-normal text-foreground">
              Product Details
            </h2>
            <dl className="mt-5 divide-y divide-white/10">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center justify-between gap-4 py-4 text-sm"
                >
                  <dt className="text-slate-400">{detail.label}</dt>
                  <dd className="font-semibold text-foreground">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </MotionReveal>

          <div className="grid gap-6">
            <MotionReveal
              aria-labelledby="product-overview-heading"
              className="rounded-lg bg-white/5 p-6 ring-1 ring-white/10 sm:p-8"
            >
              <p className="text-sm font-semibold uppercase tracking-normal text-blue-400">
                Item overview
              </p>
              <h2
                id="product-overview-heading"
                className="mt-3 text-2xl font-bold tracking-normal text-foreground"
              >
                Built for practical everyday use.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {product.name} sits in the {product.category.toLowerCase()}{" "}
                catalog as a {product.format.toLowerCase()} product sample.
                It is presented with clear format, pricing, and tag details so
                customers can compare it quickly with related store items.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                  <FormatIcon
                    className="size-5 text-blue-400"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {fulfillmentText}
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                  <Truck
                    className="size-5 text-blue-400"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Everyday catalog fit
                  </p>
                </div>
                <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
                  <ShieldCheck
                    className="size-5 text-blue-400"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Clear sample pricing
                  </p>
                </div>
              </div>
            </MotionReveal>

            <MotionReveal
              aria-labelledby="product-tags-heading"
              delay={0.1}
              className="rounded-lg bg-white/5 p-6 ring-1 ring-white/10 sm:p-8"
            >
              <div className="flex items-center gap-2">
                <Tag className="size-5 text-blue-400" aria-hidden="true" />
                <h2
                  id="product-tags-heading"
                  className="text-xl font-semibold tracking-normal text-foreground"
                >
                  Product Tags
                </h2>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-400"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </MotionReveal>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section
            aria-labelledby="related-products-heading"
            className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md"
          >
            <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
              <MotionReveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-normal text-blue-400">
                    Related products
                  </p>
                  <h2
                    id="related-products-heading"
                    className="mt-3 text-3xl font-bold tracking-normal text-foreground sm:text-4xl"
                  >
                    Similar sample items.
                  </h2>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 w-fit rounded-full border-white/10 bg-white/5 px-5 text-slate-300 hover:border-blue-500/40 hover:bg-white/10 hover:text-white"
                >
                  <Link href="/products">
                    View All Products
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </MotionReveal>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct, index) => (
                  <MotionReveal key={relatedProduct.id} delay={index * 0.1}>
                    <ProductCard
                      {...relatedProduct}
                      showAddToCart={false}
                      href={`/products/${relatedProduct.id}`}
                    />
                  </MotionReveal>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
