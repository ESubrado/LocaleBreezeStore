"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CartProduct, CartTotal } from "@/lib/cart";

const storageKey = "locale-breeze-guest-cart-v1";

type AddItemResult = "added" | "limit-reached" | "unavailable";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isReady: boolean;
  totals: CartTotal[];
  addItem: (product: CartProduct) => AddItemResult;
  setItemQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    typeof item.id === "number" &&
    Number.isInteger(item.id) &&
    typeof item.name === "string" &&
    typeof item.priceAmount === "number" &&
    Number.isFinite(item.priceAmount) &&
    typeof item.currency === "string" &&
    typeof item.imageUrl === "string" &&
    typeof item.imageAlt === "string" &&
    (item.quantity === null ||
      (typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 0)) &&
    typeof item.cartQuantity === "number" &&
    Number.isInteger(item.cartQuantity) &&
    item.cartQuantity > 0
  );
}

function readStoredCart(): CartItem[] {
  try {
    const storedCart = window.sessionStorage.getItem(storageKey);

    if (!storedCart) {
      return [];
    }

    const parsedCart: unknown = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart.filter(isCartItem).map((item) => ({
      ...item,
      cartQuantity:
        item.quantity === null
          ? item.cartQuantity
          : Math.min(item.cartQuantity, item.quantity),
    }));
  } catch {
    return [];
  }
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // A full or disabled session store should not stop the cart UI working
      // for the current page view.
    }
  }, [isReady, items]);

  const addItem = useCallback(
    (product: CartProduct): AddItemResult => {
      if (product.quantity === 0) {
        return "unavailable";
      }

      const existingItem = items.find((item) => item.id === product.id);

      if (
        product.quantity !== null &&
        (existingItem?.cartQuantity ?? 0) >= product.quantity
      ) {
        return "limit-reached";
      }

      setItems((currentItems) => {
        const currentItem = currentItems.find((item) => item.id === product.id);

        if (!currentItem) {
          return [...currentItems, { ...product, cartQuantity: 1 }];
        }

        if (
          product.quantity !== null &&
          currentItem.cartQuantity >= product.quantity
        ) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                ...product,
                cartQuantity: item.cartQuantity + 1,
              }
            : item,
        );
      });

      return "added";
    },
    [items],
  );

  const setItemQuantity = useCallback(
    (productId: number, quantity: number) => {
      setItems((currentItems) =>
        currentItems.flatMap((item) => {
          if (item.id !== productId) {
            return [item];
          }

          const maximumQuantity = item.quantity ?? Number.MAX_SAFE_INTEGER;
          const nextQuantity = Math.min(
            Math.max(0, Math.floor(quantity)),
            maximumQuantity,
          );

          return nextQuantity > 0
            ? [{ ...item, cartQuantity: nextQuantity }]
            : [];
        }),
      );
    },
    [],
  );

  const removeItem = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((count, item) => count + item.cartQuantity, 0),
    [items],
  );

  const totals = useMemo(() => {
    const amountsByCurrency = new Map<string, number>();

    items.forEach((item) => {
      const amount = amountsByCurrency.get(item.currency) ?? 0;
      amountsByCurrency.set(
        item.currency,
        amount + item.priceAmount * item.cartQuantity,
      );
    });

    return Array.from(amountsByCurrency, ([currency, amount]) => ({
      currency,
      amount,
    }));
  }, [items]);

  const getItemQuantity = useCallback(
    (productId: number) =>
      items.find((item) => item.id === productId)?.cartQuantity ?? 0,
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      isReady,
      totals,
      addItem,
      setItemQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
    }),
    [
      addItem,
      clearCart,
      getItemQuantity,
      isReady,
      itemCount,
      items,
      removeItem,
      setItemQuantity,
      totals,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used within CartProvider.");
  }

  return cart;
}
