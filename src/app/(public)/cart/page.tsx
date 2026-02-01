"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import { useCartStore } from "@/lib/cart-store";

function moneyBDT(value: number) {
  return `৳${Math.round(value)}`;
}

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const [promo, setPromo] = React.useState("");

  const subtotal = React.useMemo(() => {
    return items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
  }, [items]);

  const shipping = 0;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <main className="pb-14">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add some medicines and come back here.
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild className="btn-primary rounded-xl">
                <Link href="/shop">Go to Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-14">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Shopping cart items
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your medicines and continue to checkout.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="btn-outline rounded-xl"
              onClick={clear}
            >
              Clear cart
            </Button>
            <Button asChild variant="outline" className="btn-outline rounded-xl">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-2xl border border-border bg-card">
            <CardContent className="p-0">
              <div className="hidden grid-cols-[1.4fr_.8fr_.7fr_.6fr] gap-4 border-b border-border px-5 py-4 text-xs font-semibold text-muted-foreground md:grid">
                <div>Product</div>
                <div>Quantity</div>
                <div className="text-right">Price</div>
                <div className="text-right">Amount</div>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => {
                  const price = Number(item.price);
                  const amount = price * item.qty;

                  return (
                    <div
                      key={item.id}
                      className="grid gap-4 px-5 py-5 md:grid-cols-[1.4fr_.8fr_.7fr_.6fr]"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted">
                          <Image
                            src={item.image || "/images/placeholder.png"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.manufacturer}
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 hover:underline"
                              onClick={() => remove(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="inline-flex items-center rounded-xl border border-border bg-background">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl"
                            onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <div className="w-12 text-center text-sm font-medium">
                            {item.qty}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end">
                        <span className="text-xs text-muted-foreground md:hidden">
                          Price
                        </span>
                        <span className="text-sm font-medium">
                          {moneyBDT(price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between md:justify-end">
                        <span className="text-xs text-muted-foreground md:hidden">
                          Amount
                        </span>
                        <span className="text-sm font-semibold">
                          {moneyBDT(amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Tip: Keep your shipping address ready for faster checkout.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-2xl border border-border bg-card">
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Summary</p>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{moneyBDT(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : moneyBDT(shipping)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Add promocode
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="e.g. MEDI10"
                      className="rounded-xl"
                    />
                    <Button variant="outline" className="btn-outline rounded-xl">
                      Apply
                    </Button>
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    {moneyBDT(total)}
                  </span>
                </div>

                <Button asChild className="btn-primary mt-5 w-full rounded-xl">
                  <Link href="/checkout">Checkout</Link>
                </Button>

                <p className="mt-3 text-xs text-muted-foreground">
                  Cash on Delivery available. Prices shown in BDT.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </main>
  );
}
