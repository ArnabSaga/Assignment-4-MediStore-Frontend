import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";

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
    secondary: { text: "Order Now", url: "/shop" },
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
    <section className={cn("py-12 md:py-20", className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
        {/* Left */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            {heading}
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-sm text-muted-foreground md:text-base lg:text-lg">
            {description}
          </p>

          {/* Reviews */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <span className="inline-flex items-center -space-x-4">
              {reviews.avatars.map((avatar, index) => (
                <Avatar key={index} className="h-10 w-10 border border-border">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                </Avatar>
              ))}
            </span>

            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center gap-1 sm:justify-start">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4"
                    style={{
                      fill: "currentColor",
                      opacity: i < Math.round(rating) ? 1 : 0.25,
                    }}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">
                  {rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                from {reviews.count}+ reviews
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            {buttons.primary && (
              <Button
                asChild
                className={cn(
                  "btn-primary w-full sm:w-auto",
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
                className="btn-outline w-full sm:w-auto"
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
          </div>
        </div>

        {/* Right image */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-border">
            <Image
              src="/images/hero-section-image.jpg"
              alt="MediStore hero"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
