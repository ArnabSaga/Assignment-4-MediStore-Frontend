import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import RegisterClient from '@/components/auth/RegisterClient';


export default function RegisterPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 overflow-hidden lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 md:px-10">
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

        <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-muted lg:hidden">
          <div className="relative aspect-video w-full">
            <Image
              src="/images/hero-section-image.jpg"
              alt="MediStore"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/30 to-transparent dark:from-background/85" />
          </div>
        </div>

        <div className="mt-8 flex flex-1 items-center justify-center lg:mt-0">
          <div className="w-full max-w-md">
            <React.Suspense
              fallback={
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="h-6 w-56 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />
                  <div className="mt-6 h-10 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-10 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-10 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-10 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-6 h-10 w-full animate-pulse rounded bg-muted" />
                </div>
              }
            >
              <RegisterClient />
            </React.Suspense>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground lg:text-left">
          Secure signup • Trusted OTC marketplace
        </p>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/hero-section-image.jpg"
          alt="MediStore"
          fill
          sizes="45vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-l from-background/85 via-background/35 to-transparent dark:from-background/90" />
      </div>
    </div>
  );
}
