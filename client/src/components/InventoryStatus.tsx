import { getInventoryStatus } from "@/lib/inventory";

type InventoryStatusProps = {
  quantity: number | null;
  lowStockThreshold?: number | null;
  className?: string;
};

export default function InventoryStatus({
  quantity,
  lowStockThreshold,
  className = "",
}: InventoryStatusProps) {
  const status = getInventoryStatus(quantity, lowStockThreshold);

  if (!status) {
    return null;
  }

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
        status.tone === "unavailable"
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
      } ${className}`}
    >
      {status.label}
    </span>
  );
}
