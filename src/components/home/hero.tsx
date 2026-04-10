"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeroProps {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
      className?: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  reviews?: {
    count: number;
    avatars: { src: string; alt: string }[];
    rating?: number;
  };
  className?: string;
}

export function Hero({
  heading = "Your Health, Our Utmost Priority.",
  description = "Reliable healthcare delivered to your doorstep. Access genuine medicines, wellness essentials, and expert advice from a name you can trust.",
  buttons = {
    primary: { text: "Get Started", url: "/register" },
    secondary: { text: "Browse Medicines", url: "/shop" },
  },
  reviews = {
    count: 200,
    rating: 5.0,
    avatars: [
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
        alt: "Avatar 1",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
        alt: "Avatar 2",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
        alt: "Avatar 3",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
        alt: "Avatar 4",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
        alt: "Avatar 5",
      },
    ],
  },
  className,
}: HeroProps) {
  const rating = reviews.rating ?? 5;

  return (
    <section className={cn("relative overflow-hidden py-12 md:py-24 lg:py-32", className)}>
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl md:bg-primary/5" />

      <div className="container-custom relative z-10 grid items-center gap-12 lg:grid-cols-2">
        {/* Left Content */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary/80 backdrop-blur-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="tracking-wide uppercase">Certified Healthcare Provider</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {heading.split(",").map((part, i) => (
              <span key={i} className={i === 1 ? "text-primary" : ""}>
                {part}{i === 0 ? "," : ""}
                {i === 0 && <br className="hidden md:block" />}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg lg:text-xl leading-relaxed"
          >
            {description}
          </motion.p>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:items-center"
          >
            <div className="flex -space-x-3 overflow-hidden">
              {reviews.avatars.map((avatar, index) => (
                <Avatar key={index} className="h-10 w-10 ring-2 ring-background">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                </Avatar>
              ))}
            </div>

            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center gap-1 sm:justify-start">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-primary text-primary"
                    style={{ opacity: i < Math.round(rating) ? 1 : 0.25 }}
                  />
                ))}
                <span className="ml-2 text-sm font-bold">
                  {rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                Trusted by {reviews.count}+ healthy families
              </p>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            {buttons.primary && (
              <Button
                asChild
                size="lg"
                className={cn(
                  "btn-primary h-14 w-full rounded-full bg-primary text-primary-foreground px-8 font-semibold shadow-premium sm:w-auto",
                  buttons.primary.className
                )}
              >
                <Link href={buttons.primary.url}>{buttons.primary.text}</Link>
              </Button>
            )}

            {buttons.secondary && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="btn-outline h-14 w-full rounded-full border-border bg-background px-8 font-semibold sm:w-auto"
              >
                <Link
                  href={buttons.secondary.url}
                  className="inline-flex items-center gap-2"
                >
                  {buttons.secondary.text}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-xs text-muted-foreground/80 font-medium"
          >
             No hidden fees • 24/7 Delivery • Secure Checkout
          </motion.p>
        </div>

        {/* Right content / Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-(--radius-l) border border-border/50 shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-primary/5 z-10" />
            <Image
              src="/images/hero-section-image.jpg"
              alt="MediStore healthcare essentials"
              fill
              priority
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Image Overlay Badge */}
            <div className="absolute bottom-6 left-6 right-6 z-20 hidden items-center gap-4 rounded-2xl border border-white/20 bg-black/40 p-4 font-medium text-white backdrop-blur-md sm:flex">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white">
                <TruckIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Fastest Delivery</p>
                <p className="text-xs text-white/80">Average 30-45 mins city coverage</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TruckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-5.1a2 2 0 0 0-.5-1.4l-2.6-2.6a2 2 0 0 0-1.4-.5H15" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}
