import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export type ProductCardProps = {
  name: string;
  category: string;
  description: string;
  format: string;
  price: string;
  imageUrl?: string;
  imageAlt: string;
  imagePosition?: string;
  tags: string[];
  compact?: boolean;
  href?: string;
};

const fallbackProductImage = "/locale-breeze-general-store-hero.png";

export default function ProductCard({
  name,
  category,
  description,
  format,
  price,
  imageUrl = fallbackProductImage,
  imageAlt,
  imagePosition = "center",
  tags,
  compact = false,
  href,
}: ProductCardProps) {
  const visibleTags = compact ? tags.slice(0, 2) : tags;

  const card = (
    <Card
      role="article"
      className="flex h-full flex-col gap-0 overflow-hidden rounded-lg border-stone-200 bg-white py-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`relative bg-stone-100 ${
          compact ? "aspect-[16/9]" : "aspect-[4/3]"
        }`}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          style={{ objectPosition: imagePosition }}
        />
      </div>

      <CardContent
        className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}
      >
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#e6f2ef] px-3 py-1 text-xs font-semibold text-[#24786b]">
            {category}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            {format}
          </span>
        </div>

        <h3
          className={`font-semibold text-stone-950 ${
            compact ? "mt-3 text-base leading-5" : "mt-4 text-lg leading-6"
          }`}
        >
          {name}
        </h3>
        <p
          className={`mt-2 flex-1 overflow-hidden text-stone-600 ${
            compact ? "text-xs leading-5" : "text-sm leading-6"
          }`}
          style={
            compact
              ? {
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }
              : undefined
          }
        >
          {description}
        </p>

        <div className={`${compact ? "mt-3" : "mt-5"} flex flex-wrap gap-2`}>
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <CardFooter
          className={`flex items-center justify-between border-t border-stone-100 px-0 pb-0 ${
            compact ? "mt-3 pt-3" : "mt-5 pt-4"
          }`}
        >
          <span className="text-sm font-medium text-stone-500">Sample</span>
          <span
            className={`font-bold text-stone-950 ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {price}
          </span>
        </CardFooter>
      </CardContent>
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link
      href={href}
      aria-label={`View details for ${name}`}
      className="block h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#24786b] focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}
