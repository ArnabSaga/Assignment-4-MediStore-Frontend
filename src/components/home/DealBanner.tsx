import Link from "next/link";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/home/Countdown";

export function DealBanner() {
  const endsAtISO = new Date(
    Date.now() + 70 * 24 * 60 * 60 * 1000
  ).toISOString();

  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left: Deal */}
          <Card className="overflow-hidden border-border bg-card text-card-foreground">
            <CardContent className="p-6 md:p-8">
              <p className="text-xs font-medium text-muted-foreground">
                Limited Time Offer
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                MediStore Discount
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Save up to <span className="font-semibold">20%</span> on
                selected OTC medicines. Hurry—offer ends soon.
              </p>

              <Countdown endsAtISO={endsAtISO} />

              <div className="mt-6">
                <Button asChild className="btn-primary rounded-full px-6">
                  <Link href="/shop?tag=discount">Shop now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Full cover image */}
          <Card className="overflow-hidden border-border bg-card text-card-foreground">
            <CardContent className="relative min-h-65 p-0 md:min-h-80">
              <Image
                src="/images/DealBanner.jpg"
                alt="MediStore offer"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={false}
              />

              {/* subtle overlay so it looks premium */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent via-transparent to-muted/35" />

              {/* Optional: logo badge overlay */}
              <div className="absolute left-6 top-6 rounded-2xl border border-border bg-background/70 px-4 py-2 text-sm font-medium backdrop-blur">
                MediStore
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
