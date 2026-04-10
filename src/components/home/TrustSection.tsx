"use client";

import { Truck, ShieldCheck, Headphones, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const trustItems = [
  {
    icon: Truck,
    title: "Fast 24/7 Delivery",
    description: "Reliable doorstep delivery in as little as 2 hours.",
  },
  {
    icon: ShieldCheck,
    title: "Genuine Medicine",
    description: "100% authentic products sourced directly from manufacturers.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Connect with certified pharmacists for any product guidance.",
  },
  {
    icon: Clock,
    title: "Secure Payments",
    description: "Fully encrypted payment gateway for your peace of mind.",
  },
];

export function TrustSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-12 md:py-16 bg-background", className)}>
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-start p-6 rounded-m border border-border/40 bg-card/30 hover:bg-card/50 transition-colors shadow-sm"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <item.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
