import Image from "next/image";
import Link from "next/link";

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
    <article
      role="article"
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-white/10"
    >
      <div
        className={`relative overflow-hidden bg-black ${
          compact ? "aspect-[16/9]" : "aspect-[4/3]"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
        <Image
          src={defaultImageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition: imagePosition }}
        />
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            {category}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            {format}
          </span>
        </div>

        <h3
          className={`font-semibold tracking-normal text-foreground ${
            compact ? "mt-3 text-base leading-5" : "mt-4 text-lg leading-6"
          }`}
        >
          {name}
        </h3>
        <p
          className={`mt-2 flex-1 overflow-hidden text-slate-400 ${
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
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className={`flex items-center justify-between border-t border-white/10 ${
            compact ? "mt-3 pt-3" : "mt-5 pt-4"
          }`}
        >
          <span className="text-sm font-medium text-slate-500">Sample</span>
          <span
            className={`font-bold text-foreground ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {price}
          </span>
        </div>
      </div>
    </article>
  );

  if (!href) {
    return card;
  }

  return (
    <Link
      href={href}
      aria-label={`View details for ${name}`}
      className="block h-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      {card}
    </Link>
  );
}
