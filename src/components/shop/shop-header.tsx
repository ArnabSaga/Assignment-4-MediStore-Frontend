"use client";

import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function buildQueryString(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>
) {
  const sp = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") sp.delete(key);
    else sp.set(key, value);
  }

  if ("q" in updates || "category" in updates || "sort" in updates) {
    sp.delete("page");
  }

  return sp.toString();
}

export function ShopHeader({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? undefined;
  const qFromUrl = searchParams.get("q") ?? "";

  const [q, setQ] = React.useState(qFromUrl);
  const [placeholder, setPlaceholder] = React.useState("");
  const stopTypingRef = React.useRef(false);
  const fullText = "Search Medicine (Ex: Napa)";

  React.useEffect(() => {
    // stop typing if we have a search query (placeholder hidden anyway)
    if (q) {
      stopTypingRef.current = true;
      setPlaceholder(fullText);
      return;
    }
  }, [q]);

  React.useEffect(() => {
    // skip if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setPlaceholder(fullText);
      return;
    }

    let i = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      // If user has interacted, stop the loop and show full placeholder
      if (stopTypingRef.current) {
        setPlaceholder(fullText);
        return;
      }

      const currentText = isDeleting
        ? fullText.slice(0, i)
        : fullText.slice(0, i);

      setPlaceholder(currentText || " "); // space to avoid height jump if needed, or empty

      if (!isDeleting && i === fullText.length) {
        timeoutId = setTimeout(() => {
          isDeleting = true;
          type();
        }, 3500);
        return;
      }

      if (isDeleting && i === 0) {
        isDeleting = false;
        timeoutId = setTimeout(type, 800);
        return;
      }

      i = isDeleting ? i - 1 : i + 1;
      const speed = isDeleting ? 40 : 75;
      timeoutId = setTimeout(type, speed);
    };

    type();

    return () => clearTimeout(timeoutId);
  }, []);

  React.useEffect(() => {
    if (q === qFromUrl) return;

    // stop typing if user starts typing
    if (q.length > 0) {
      stopTypingRef.current = true;
    }

    const t = setTimeout(() => {
      const next = buildQueryString(searchParams, { q });
      const current = searchParams.toString();

      if (next === current) return;

      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    }, 350);

    return () => clearTimeout(t);
  }, [q, pathname, router, qFromUrl, searchParams]);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/70",
        "bg-background/95",
        className
      )}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-10%] top-[-18%] h-56 w-56 rounded-full bg-primary/10 blur-3xl md:h-72 md:w-72 dark:bg-primary/15" />
        <div className="absolute right-[-8%] top-[10%] h-48 w-48 rounded-full bg-(--button-accent)/10 blur-3xl md:h-64 md:w-64" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/70" />
      </div>

      <div className="container-custom relative z-10 py-6 md:py-8 lg:py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="shop-panel overflow-hidden p-4 sm:p-5 md:p-6"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="link-hover">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Shop</span>
            {category ? (
              <>
                <span>/</span>
                <span className="max-w-48 truncate text-foreground capitalize">
                  {category.replace(/-/g, " ")}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Curated healthcare essentials
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.8rem]">
                Explore trusted products for everyday care
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                {category ? (
                  <>
                    Showing products from{" "}
                    <span className="font-medium capitalize text-foreground">
                      {category.replace(/-/g, " ")}
                    </span>
                    . Refine your search to find the right medicine faster.
                  </>
                ) : (
                  "Browse medicines, wellness essentials, and OTC products with a cleaner, faster, premium shopping experience."
                )}
              </p>
            </div>

            <div className="w-full lg:max-w-sm">
              <label
                htmlFor="shop-search"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Search products
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="shop-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => (stopTypingRef.current = true)}
                  className="shop-search"
                  placeholder={placeholder}
                  aria-label="Search medicines"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
