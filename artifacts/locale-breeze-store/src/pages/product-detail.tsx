import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
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
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import "@/styles/fluid-theme.css";

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

export default function ProductItemPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const [product, setProduct] = useState<Product | null | undefined>(
    undefined,
  );
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!Number.isInteger(productId)) {
      setProduct(null);
      return;
    }

    let isMounted = true;
    setProduct(undefined);

    Promise.all([
      getProductCatalogPageData(),
      getProductById(productId),
    ])
      .then(([{ products }, foundProduct]) => {
        if (!isMounted) return;
        setAllProducts(products);
        setProduct(foundProduct ?? null);
      })
      .catch((error) => {
        console.error("Failed to load product", error);
        if (isMounted) {
          setProduct(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (product === undefined) {
    return (
      <>
        <Navigation />
        <main className="fluid-home dark flex min-h-[50vh] items-center justify-center bg-background text-slate-400">
          Loading product...
        </main>
        <SiteFooter />
      </>
    );
  }

  if (product === null) {
    return <NotFound />;
  }

  const relatedProducts = getRelatedProducts(product, allProducts);
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

      <main className="fluid-home dark bg-background text-foreground">
        <div className="fluid-home-noise" />

        <section className="relative overflow-hidden px-5 pt-24 pb-16 sm:px-8 lg:pb-24">
          <div className="fluid-home-gradient-blur" />
          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
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

              <h1 className="mt-5 bg-gradient-to-b from-white to-white/40 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
                {product.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10"
            >
              <Carousel aria-label={`${product.name} images`}>
                <CarouselContent className="ml-0">
                  {productImages.map((imageUrl, index) => (
                    <CarouselItem key={imageUrl} className="basis-full pl-0">
                      <div className="relative min-h-80 overflow-hidden bg-black sm:min-h-[31rem]">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                        <img
                          src={imageUrl}
                          alt={
                            index === 0
                              ? product.imageAlt
                              : `${product.imageAlt} ${index + 1}`
                          }
                          className="absolute inset-0 h-full w-full object-cover"
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
              <div className="absolute bottom-4 left-4 rounded-2xl bg-black/60 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                <span className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Sample price
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {product.price}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:py-24">
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="h-fit rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
          >
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
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
          </motion.aside>

          <div className="grid gap-6">
            <motion.section
              aria-labelledby="product-overview-heading"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8"
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                Item overview
              </p>
              <h2
                id="product-overview-heading"
                className="mt-3 text-2xl font-bold tracking-tight text-foreground"
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
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <FormatIcon
                    className="size-5 text-blue-400"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {fulfillmentText}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <Truck className="size-5 text-blue-400" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Everyday catalog fit
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <ShieldCheck
                    className="size-5 text-blue-400"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Clear sample pricing
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              aria-labelledby="product-tags-heading"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8"
            >
              <div className="flex items-center gap-2">
                <Tag className="size-5 text-blue-400" aria-hidden="true" />
                <h2
                  id="product-tags-heading"
                  className="text-xl font-semibold tracking-tight text-foreground"
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
            </motion.section>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section
            aria-labelledby="related-products-heading"
            className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md"
          >
            <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
                className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                    Related products
                  </p>
                  <h2
                    id="related-products-heading"
                    className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
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
              </motion.div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct, idx) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                  >
                    <ProductCard
                      {...relatedProduct}
                      href={`/products/${relatedProduct.id}`}
                    />
                  </motion.div>
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
