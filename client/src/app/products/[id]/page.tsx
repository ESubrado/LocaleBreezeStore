import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
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
  getProducts,
  type Product,
} from "@/api/products";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const productImage = "/locale-breeze-general-store-hero.png";

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

export async function generateStaticParams() {
  const products = await getProducts();

  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product not found | Locale Breeze Store",
    };
  }

  return {
    title: `${product.name} | Locale Breeze Store`,
    description: product.description,
  };
}

export default async function ProductItemPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [{ products }, product] = await Promise.all([
    getProductCatalogPageData(),
    getProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product, products);
  const FormatIcon = product.format === "Physical" ? PackageCheck : FileText;
  const fulfillmentText =
    product.format === "Physical"
      ? "Shelf-ready physical sample"
      : "Prepared as a download sample";

  const details = [
    { label: "Price", value: product.price },
    { label: "Category", value: product.category },
    { label: "Format", value: product.format },
    { label: "Catalog status", value: "Sample item" },
  ];

  return (
    <>
      <Navigation />

      <main className="bg-[#f7faf7] text-stone-950">
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-14">
            <div>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="h-11 rounded-full px-0 text-stone-600 hover:bg-transparent hover:text-[#24786b]"
              >
                <Link href="/products">
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Products
                </Link>
              </Button>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#e6f2ef] px-3 py-1 text-xs font-semibold text-[#24786b]">
                  {product.category}
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                  {product.format}
                </span>
              </div>

              <h1 className="mt-4 text-4xl font-bold leading-tight text-stone-950 sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-700">
                {product.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-full bg-stone-950 px-5 text-white hover:bg-[#24786b]"
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
                  className="h-11 rounded-full border-stone-300 bg-white px-5 text-stone-950 hover:border-[#24786b] hover:text-[#24786b]"
                >
                  <Link href="/products">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back To Catalog
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-80 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm sm:min-h-[31rem]">
              <Image
                src={productImage}
                alt={product.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: product.imagePosition ?? "center" }}
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-white/92 px-4 py-3 shadow-sm backdrop-blur">
                <span className="block text-xs font-semibold uppercase tracking-normal text-stone-500">
                  Sample price
                </span>
                <span className="text-2xl font-bold text-stone-950">
                  {product.price}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:py-16">
          <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-950">
              Product Details
            </h2>
            <dl className="mt-5 divide-y divide-stone-100">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center justify-between gap-4 py-4 text-sm"
                >
                  <dt className="text-stone-500">{detail.label}</dt>
                  <dd className="font-semibold text-stone-950">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>

          <div className="grid gap-6">
            <section
              aria-labelledby="product-overview-heading"
              className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-normal text-[#b15a2b]">
                Item overview
              </p>
              <h2
                id="product-overview-heading"
                className="mt-3 text-2xl font-bold text-stone-950"
              >
                Built for practical everyday use.
              </h2>
              <p className="mt-4 text-sm leading-7 text-stone-700">
                {product.name} sits in the {product.category.toLowerCase()}{" "}
                catalog as a {product.format.toLowerCase()} product sample.
                It is presented with clear format, pricing, and tag details so
                customers can compare it quickly with related store items.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
                  <FormatIcon
                    className="size-5 text-[#24786b]"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-stone-950">
                    {fulfillmentText}
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
                  <Truck
                    className="size-5 text-[#24786b]"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-stone-950">
                    Everyday catalog fit
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-[#fbfcf8] p-4">
                  <ShieldCheck
                    className="size-5 text-[#24786b]"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-stone-950">
                    Clear sample pricing
                  </p>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="product-tags-heading"
              className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Tag className="size-5 text-[#24786b]" aria-hidden="true" />
                <h2
                  id="product-tags-heading"
                  className="text-xl font-semibold text-stone-950"
                >
                  Product Tags
                </h2>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section
            aria-labelledby="related-products-heading"
            className="border-t border-stone-200 bg-white"
          >
            <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-normal text-[#24786b]">
                    Related products
                  </p>
                  <h2
                    id="related-products-heading"
                    className="mt-3 text-3xl font-bold text-stone-950"
                  >
                    Similar sample items.
                  </h2>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 w-fit rounded-full border-stone-300 bg-white px-5 text-stone-950 hover:border-[#24786b] hover:text-[#24786b]"
                >
                  <Link href="/products">View All Products</Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    {...relatedProduct}
                    href={`/products/${relatedProduct.id}`}
                  />
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
