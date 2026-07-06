import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export type ProductCardProps = {
  name: string;
  category: string;
  description: string;
  format: string;
  price: string;
  imageUrl?: string;
  imageUrls?: string[];
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
  imageUrl,
  imageUrls,
  imageAlt,
  imagePosition = "center",
  tags,
  compact = false,
  href,
}: ProductCardProps) {
  const visibleTags = compact ? tags.slice(0, 2) : tags;
  const defaultImageUrl = imageUrls?.[0] ?? imageUrl ?? fallbackProductImage;

  const card = (
    <Card
      role="article"
      className="flex h-full flex-col gap-0 overflow-hidden rounded-md border-border bg-card py-0 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div
        className={`relative bg-muted ${
          compact ? "aspect-[16/9]" : "aspect-[4/3]"
        }`}
      >
        <img
          src={defaultImageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: imagePosition }}
        />
      </div>

      <CardContent
        className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}
      >
        <div className="flex flex-wrap gap-2">
          <span className="rounded-sm bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            {category}
          </span>
          <span className="rounded-sm bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {format}
          </span>
        </div>

        <h3
          className={`font-semibold text-foreground ${
            compact ? "mt-3 text-base leading-5" : "mt-4 text-lg leading-6"
          }`}
        >
          {name}
        </h3>
        <p
          className={`mt-2 flex-1 overflow-hidden text-muted-foreground ${
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
              className="rounded-sm border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <CardFooter
          className={`flex items-center justify-between border-t border-border px-0 pb-0 ${
            compact ? "mt-3 pt-3" : "mt-5 pt-4"
          }`}
        >
          <span className="text-sm font-medium text-muted-foreground">Sample</span>
          <span
            className={`font-bold text-foreground ${
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
      className="block h-full rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}
