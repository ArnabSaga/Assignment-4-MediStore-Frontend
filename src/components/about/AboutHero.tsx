"use client";

import Image from "next/image";
import { CheckCircle2, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const featured = {
  badge: "CEO & Founder",
  name: "Achyuta Arnab Dey",
  title: "Founder, MediStore",
  signature: "Arnab Dey",
  description:
    "MediStore is built with a single mission: make trusted OTC medicines accessible, safe, and convenient for everyone. We believe that healthcare shouldn't just be a transaction—it should be a foundation for living a better, healthier life.",
  story: "Founded in 2023, MediStore started as a vision to bridge the gap between quality pharmacy services and digital convenience. Our journey began with a small team dedicated to verifying every supplier and ensuring that no compromise is made on patient safety.",
  highlights: [
    "Trust-first healthcare mindset",
    "Secure, scalable commerce architecture",
    "100% Verified medical listings",
    "Clinically guided safety protocols",
  ],
  image: "/images/team/arnab.jpg",
};

export function AboutHero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-12 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-12 h-96 w-96 bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">

          {/* Narrative Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-6 group cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-medium tracking-wide uppercase text-primary">Our Story</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
              Pioneering the Future of <span className="text-primary italic">Trusted</span> Healthcare.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              {featured.story}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {featured.highlights.map((h, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  key={h}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-card/40"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{h}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-border/50">
              <div>
                <p className="text-2xl font-display font-bold italic tracking-wider text-foreground/80">
                  {featured.signature}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  Designation: {featured.title}
                </p>
              </div>
            </div>
          </motion.div>

          {/* CEO Spotlight Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative glass-surface rounded-4xl overflow-hidden shadow-2xl p-4">
                <div className="relative aspect-4/5 rounded-3xl overflow-hidden">
                  {/* Badge */}
                  <div className="absolute top-6 left-6 z-20">
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 border-none px-4 py-1.5 rounded-full shadow-lg">
                      {featured.badge}
                    </Badge>
                  </div>

                  {/* Hover Overlay: Hide image, show quote */}
                  <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 bg-primary/95 text-center">
                    <Quote className="h-10 w-10 text-primary-foreground/40 mb-6" />
                    <p className="text-primary-foreground text-xl font-medium leading-relaxed italic">
                      &quot;{featured.description}&quot;
                    </p>
                    <div className="h-px w-16 bg-primary-foreground/30 my-6" />
                    <p className="text-primary-foreground/80 text-sm font-semibold tracking-widest uppercase">
                      — {featured.name}
                    </p>
                  </div>

                  {/* Image (Hides on hover via group-hover:opacity-0 if desired, or kept under overlay) */}
                  <Image
                    src={featured.image}
                    alt={featured.name}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-primary/20 blur-3xl rounded-full" />
              <div className="absolute -top-6 -left-6 h-24 w-24 bg-primary/20 blur-3xl rounded-full" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
