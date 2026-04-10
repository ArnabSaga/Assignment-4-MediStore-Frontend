"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/home/Countdown";
import { cn } from "@/lib/utils";

export function DealBanner({ className }: { className?: string }) {
  const endsAtISO = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  return (
    <section className={cn("py-12 md:py-20", className)}>
      <div className="container-custom">
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
          <div className="grid gap-0 overflow-hidden rounded-(--radius-l) border border-border/50 shadow-2xl md:grid-cols-2">
            {/* Left: Content */}
            <div className="relative flex flex-col justify-center bg-zinc-900 p-8 text-white md:p-12 lg:p-16">
              {/* Decorative Glow */}
              <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                
              <div className="relative z-10">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary backdrop-blur-md">
                   Limited Flash Deal
                </span>

                <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                   MediStore <span className="text-primary italic">Saver</span> Weeks
                </h2>

                <p className="mt-4 max-w-md text-sm font-medium text-white/70 md:text-base leading-relaxed">
                   Get up to <span className="font-bold text-white uppercase tracking-tighter text-xl">25% OFF</span> on 
                   essential chronic care medicines. Your health, our commitment.
                </p>

                <div className="mt-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Offers Ending In</p>
                    <div className="inline-block scale-90 sm:scale-100 origin-left">
                        <Countdown endsAtISO={endsAtISO} />
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Button asChild size="lg" className="h-12 rounded-full bg-primary px-8 font-bold uppercase tracking-widest text-xs transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                    <Link href="/shop?tag=discount">Claim Discount</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-white/20 bg-white/5 px-8 font-bold uppercase tracking-widest text-xs backdrop-blur-md hover:bg-white/10 text-white">
                    <Link href="/shop">View Details</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative min-h-[300px] md:min-h-full overflow-hidden bg-zinc-100">
              <Image
                src="/images/DealBanner.jpg"
                alt="MediStore seasonal medicine offer"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority={false}
              />
              
              {/* Dynamic Overlay */}
              <div className="absolute inset-0 bg-linear-to-l from-black/20 via-transparent to-black/10 md:hidden" />
              
              {/* Logo/Badge Overlay */}
              <div className="absolute right-8 top-8 hidden rounded-2xl border border-white/20 bg-black/40 px-5 py-3 text-sm font-bold text-white backdrop-blur-md lg:block">
                Verified Healthcare
              </div>
              
              {/* Bottom Quote Overlay */}
              <div className="absolute bottom-8 left-8 right-8 rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-medium text-white/90 backdrop-blur-sm shadow-xl lg:hidden">
                 "Fast delivery, genuine medicine. Exactly what I needed."
                 <p className="mt-1 font-bold text-primary/80">— Happy Customer</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
