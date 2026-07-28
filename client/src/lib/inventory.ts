export type InventoryStatus = {
  label: string;
  tone: "low" | "unavailable";
} | null;

export function getInventoryStatus(
  quantity: number | null,
  lowStockThreshold: number | null | undefined = 10,
): InventoryStatus {
  const threshold = lowStockThreshold ?? 10;

  if (quantity === null || quantity > threshold) {
    return null;
  }

  if (quantity === 0) {
    return { label: "Out of stock", tone: "unavailable" };
  }

  if (quantity <= 5) {
    return { label: `Only ${quantity} left`, tone: "low" };
  }

  return { label: "Low stock", tone: "low" };
}
