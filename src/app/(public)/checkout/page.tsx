"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Truck } from "lucide-react";

import { env } from "@/env";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCartStore } from "@/lib/cart-store";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const API_BASE = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");

function moneyBDT(value: number) {
  return `৳${Math.round(value)}`;
}

function readApiError(json: any, fallback: string) {
  if (!json) return fallback;
  if (typeof json.message === "string" && json.message.trim())
    return json.message;
  if (typeof json.error === "string" && json.error.trim()) return json.error;
  return fallback;
}

export default function CheckoutPage() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const clear = useCartStore((s) => s.clear);

  const [loading, setLoading] = React.useState(false);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");

  if (!items.length) {
    return (
      <main className="pb-14">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-lg font-semibold">No items to checkout</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your cart is empty.
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

  const shipping = 0;
  const total = totalAmount() + shipping;

  const placeOrder = async () => {
    if (loading) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("Please fill all delivery details.");
      return;
    }

    const shippingAddress = `Name: ${name.trim()}\nPhone: ${phone.trim()}\nAddress: ${address.trim()}`;

    const payload = {
      shippingAddress,
      items: items.map((i) => ({
        medicineId: i.id,
        quantity: i.qty, 
      })),
    };

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => null)) as ApiResponse<{
        id: string;
      }> | null;

      if (res.status === 401 || res.status === 403) {
        router.push(`/login?next=${encodeURIComponent("/checkout")}`);
        return;
      }

      if (!res.ok || !json?.success || !json.data?.id) {
        throw new Error(readApiError(json, "Order failed"));
      }

      clear();
      router.push(`/account/orders/${json.data.id}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pb-14">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm your delivery details and place the order.
          </p>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="rounded-2xl border border-border bg-card">
              <CardContent className="space-y-4 p-5">
                <p className="text-sm font-semibold">Delivery Information</p>

                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  disabled={loading}
                />

                <Input
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl"
                  disabled={loading}
                />

                <Textarea
                  placeholder="Full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl"
                  disabled={loading}
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border bg-card">
              <CardContent className="space-y-4 p-5">
                <p className="text-sm font-semibold">Payment Method</p>

                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Pay when you receive the medicines
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-2xl border border-border bg-card">
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Order Summary</p>

                <div className="mt-4 space-y-2 text-sm">
                  {items.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">
                        {i.name} × {i.qty}
                      </span>
                      <span className="font-medium">
                        {moneyBDT(Number(i.price) * i.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {moneyBDT(totalAmount())}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : moneyBDT(shipping)}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    {moneyBDT(total)}
                  </span>
                </div>

                <Button
                  onClick={placeOrder}
                  disabled={loading}
                  className="btn-primary mt-5 w-full rounded-xl"
                >
                  {loading ? "Placing order..." : "Place Order"}
                </Button>

                <p className="mt-3 text-xs text-muted-foreground">
                  Cash on Delivery available across Bangladesh.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
