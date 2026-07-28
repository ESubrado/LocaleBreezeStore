"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/CartProvider";
import type { CartProduct } from "@/lib/cart";

type AddToCartButtonProps = CartProduct & {
  className?: string;
};

export default function AddToCartButton({
  className = "",
  ...product
}: AddToCartButtonProps) {
  const { addItem, getItemQuantity, isReady } = useCart();
  const cartQuantity = getItemQuantity(product.id);
  const isOutOfStock = product.quantity === 0;

  const handleAddToCart = () => {
    const result = addItem(product);

    if (result === "added") {
      toast.success(`${product.name} added to your cart.`);
      return;
    }

    if (result === "unavailable") {
      toast.error(`${product.name} is currently unavailable.`);
      return;
    }

    toast.warning(
      `Only ${product.quantity} available. Your cart already contains ${cartQuantity}.`,
    );
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!isReady || isOutOfStock}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-blue-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 ${className}`}
    >
      <ShoppingCart className="size-4" aria-hidden="true" />
      {isOutOfStock
        ? "Unavailable"
        : "Add to cart"}
    </button>
  );
}
