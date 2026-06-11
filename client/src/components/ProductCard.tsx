import Image from "next/image";

export type ProductCardProps = {
  name: string;
  category: string;
  description: string;
  format: string;
  price: string;
  imageAlt: string;
  imagePosition?: string;
  tags: string[];
  compact?: boolean;
};

const productImage = "/locale-breeze-general-store-hero.png";

export default function ProductCard({
  name,
  category,
  description,
  format,
  price,
  imageAlt,
  imagePosition = "center",
  tags,
  compact = false,
}: ProductCardProps) {
  const visibleTags = compact ? tags.slice(0, 2) : tags;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`relative bg-stone-100 ${
          compact ? "aspect-[16/9]" : "aspect-[4/3]"
        }`}
      >
        <Image
          src={productImage}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          style={{ objectPosition: imagePosition }}
        />
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
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

        <div
          className={`flex items-center justify-between border-t border-stone-100 ${
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
        </div>
      </div>
    </article>
  );
}
