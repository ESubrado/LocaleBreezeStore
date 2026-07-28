"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/CartProvider";
import InventoryStatus from "@/components/InventoryStatus";
import Navigation from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

export default function CartPage() {
  const {
    clearCart,
    isReady,
    itemCount,
    items,
    removeItem,
    setItemQuantity,
    totals,
  } = useCart();

  const handleIncrease = (item: (typeof items)[number]) => {
    const result = setItemQuantity(item.id, item.cartQuantity + 1);

    if (result === "limit-reached") {
      toast.warning(
        `Only ${item.quantity} available. You cannot add more ${item.name} items.`,
      );
    }
  };

  return (
    <>
      <Navigation />
      <main className="fluid-home dark min-h-[calc(100vh-4rem)] bg-background px-5 py-14 text-foreground sm:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-normal text-blue-400">
            Guest cart
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-normal text-foreground sm:text-5xl">
                Your cart
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Your items are saved for this browser session and will clear when
                the session ends.
              </p>
            </div>
            {isReady && items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="w-fit text-sm font-semibold text-slate-400 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Clear cart
              </button>
            ) : null}
          </div>

          {!isReady ? (
            <p className="mt-10 text-slate-400">Loading your cart...</p>
          ) : items.length === 0 ? (
            <section className="mt-10 rounded-xl bg-white/5 p-8 text-center ring-1 ring-white/10 sm:p-12">
              <ShoppingBag className="mx-auto size-8 text-blue-400" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-semibold text-foreground">
                Your cart is empty.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                Discover a useful product, then add it here whenever you are
                ready.
              </p>
              <Link
                href="/products"
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-blue-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Browse products
              </Link>
            </section>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
              <section
                aria-label="Cart items"
                className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10"
              >
                <ul className="divide-y divide-white/10">
                  {items.map((item) => {
                    return (
                      <li
                        key={item.id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black sm:w-24">
                          <Image
                            src={item.imageUrl}
                            alt={item.imageAlt}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="font-semibold text-foreground">
                            {item.name}
                          </h2>
                          <p className="mt-1 text-sm text-slate-400">
                            {formatMoney(item.priceAmount, item.currency)} each
                          </p>
                          <InventoryStatus
                            quantity={item.quantity}
                            lowStockThreshold={item.lowStockThreshold}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <div className="inline-flex items-center rounded-full border border-white/10 bg-black/20 p-1">
                            <button
                              type="button"
                              onClick={() =>
                                setItemQuantity(item.id, item.cartQuantity - 1)
                              }
                              aria-label={`Decrease ${item.name} quantity`}
                              className="inline-flex size-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                            >
                              <Minus className="size-4" aria-hidden="true" />
                            </button>
                            <span className="min-w-9 text-center text-sm font-semibold text-foreground">
                              {item.cartQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrease(item)}
                              aria-label={`Increase ${item.name} quantity`}
                              className="inline-flex size-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                            >
                              <Plus className="size-4" aria-hidden="true" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <aside className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                <h2 className="text-xl font-semibold text-foreground">
                  Cart summary
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </p>
                <dl className="mt-6 space-y-3 border-y border-white/10 py-5">
                  {totals.map((total) => (
                    <div
                      key={total.currency}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <dt className="text-slate-400">Subtotal</dt>
                      <dd className="font-semibold text-foreground">
                        {formatMoney(total.amount, total.currency)}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 text-xs leading-5 text-slate-500">
                  Checkout is not available yet. Prices and availability will be
                  confirmed when payments are introduced.
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 transition hover:border-blue-500/40 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Continue shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
