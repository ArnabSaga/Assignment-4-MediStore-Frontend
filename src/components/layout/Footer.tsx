"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FooterLink = { label: string; href: string };

const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Features",
    links: [
      { label: "Payment", href: "/#payment" },
      { label: "Card", href: "/#card" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export function Footer() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = React.useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    // Simulated network delay
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      // Reset back to idle after a while
      setTimeout(() => setStatus("idle"), 4000);
    }, 1500);
  };

  return (
    <footer className="relative border-t border-border bg-background overflow-hidden">
      {/* Ambient Glow */}
      <div 
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-64 w-[80%] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px] dark:bg-primary/10" 
        aria-hidden="true" 
      />

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-12 md:py-16">
        {/* Elite Newsletter Panel */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-950/40 backdrop-blur-md border border-border/40 shadow-premium group transition-all duration-300 hover:shadow-premium-hover hover:border-primary/20">
          {/* Subtle gradient overlay for the card */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-50" />
          
          <div className="relative grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12 lg:p-16">
            {/* Left side */}
            <div className="space-y-4 max-w-lg">
              <h3 className="text-3xl font-bold tracking-tight md:text-4xl">
                Subscribe to our newsletter
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Stay informed with the latest updates, exclusive product news, and helpful health
                tips for smarter medicine shopping.
              </p>
            </div>

            {/* Right side form */}
            <div className="space-y-4 md:ml-auto w-full max-w-md">
              <p className="text-sm font-medium text-foreground">Stay up to date</p>

              <form
                onSubmit={handleSubscribe}
                className="flex w-full flex-col gap-3 relative"
              >
                <div className="flex w-full flex-col sm:flex-row gap-3">
                  <Input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading" || status === "success"}
                    placeholder="Enter your email"
                    className="h-12 w-full rounded-2xl bg-white/50 dark:bg-black/40 border-border/50 backdrop-blur-sm transition-all focus-visible:ring-primary/30 disabled:opacity-50 text-base px-4"
                  />
                  <Button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className="h-12 rounded-2xl sm:w-auto px-8 shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none bg-[#1292BD] hover:bg-[#0f7a9f] text-white hover:text-white"
                  >
                    {status === "loading" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : status === "success" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Subscribe <Send className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
                
                {/* CLS-safe feedback area */}
                <div className="h-5 px-1 flex items-center transition-opacity duration-300">
                  {status === "success" && (
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Successfully subscribed!
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-sm font-medium text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Please enter a valid email address.
                    </p>
                  )}
                </div>
              </form>

              <p className="text-xs text-muted-foreground">
                By subscribing you agree to our{" "}
                <Link href="/privacy" className="font-medium text-foreground hover:text-primary transition-colors hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Structure */}
        {/* 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
        <div className="mt-16 grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1 flex flex-col items-start">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
               <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 transition-all group-hover:bg-primary/20">
                 <img src="/icons/logo.png" alt="MediStore" width={24} height={24} className="h-6 w-6 object-contain brightness-0 dark:brightness-100" />
               </span>
               <span className="text-lg font-bold tracking-tight">
                  Medi<span className="text-primary">Store</span>
               </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Your trusted online medicine shop. Browse OTC medicines, order
              safely, and track deliveries with elite ease and security.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title} className="col-span-1 flex flex-col">
              <h4 className="text-base font-semibold text-foreground tracking-tight">{col.title}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm font-medium text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-x-0.5 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col gap-4 border-t border-border/40 pt-8 pb-[env(safe-area-inset-bottom)] sm:flex-row sm:items-center sm:justify-between text-sm">
          <p className="text-muted-foreground font-medium">
            © {new Date().getFullYear()} MediStore. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-muted-foreground font-medium transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground font-medium transition-colors hover:text-primary">
              Terms
            </Link>
            <Link href="/cookies" className="text-muted-foreground font-medium transition-colors hover:text-primary">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
