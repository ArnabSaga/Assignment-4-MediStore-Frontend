import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2  overflow-hidden">
      {/* LEFT */}
      <div className="flex flex-col px-6 py-8 md:px-10">
        {/* Brand */}
        <div className="flex items-center justify-center lg:justify-start">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-border bg-card">
              <Image
                src="/icons/logo.png"
                alt="MediStore"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
              />
            </span>

            <span className="font-semibold tracking-tight">
              Medi<span className="text-muted-foreground">Store</span>
            </span>
          </Link>
        </div>

        {/* Mobile banner image */}
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-muted lg:hidden">
          <div className="relative aspect-video w-full">
            <Image
              src="/images/hero-section-image.jpg"
              alt="MediStore"
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/30 to-transparent dark:from-background/85" />
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 flex flex-1 items-center justify-center lg:mt-0">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-8 text-center text-xs text-muted-foreground lg:text-left">
          OTC medicines only • Safe shopping • Fast delivery
        </p>
      </div>

      {/* RIGHT (Desktop image) */}
      <div className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-section-image.jpg"
            alt="MediStore"
            fill
            sizes="50vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-linear-to-l from-background/85 via-background/35 to-transparent dark:from-background/90" />
        </div>

        {/* Optional overlay content */}
        <div className="relative flex h-full items-end p-10">
          <div className="max-w-sm rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
            <p className="text-sm font-medium">Trusted OTC marketplace</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Genuine products, clear categories, and a smooth checkout
              experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
