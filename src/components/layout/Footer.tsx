import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FooterLink = { label: string; href: string };

const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Features",
    links: [
      { label: "Payment", href: "#" },
      { label: "Card", href: "#" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        {/* Newsletter Banner */}
        <Card className="overflow-hidden border-border">
          <CardContent className="p-0">
            <div className="grid gap-6 p-6 md:grid-cols-2 md:items-center md:p-10">
              {/* Left */}
              <div className="space-y-2">
                <p className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Subscribe our newsletter
                </p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Subscribe to get updates, product news, and helpful health
                  tips for smarter medicine shopping.
                </p>
              </div>

              {/* Right */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Stay up to date</p>

                <form
                  action="#"
                  method="post"
                  className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="h-10 w-full"
                  />
                  <Button
                    type="submit"
                    className="btn-primary h-10 w-full sm:w-auto sm:px-6"
                  >
                    Subscribe
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground">
                  By subscribing you agree to our{" "}
                  <Link href="#" className="link-hover">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Footer */}
        <div className="mt-10 grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="text-lg font-semibold tracking-tight">
              MediStore
            </div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Your trusted online medicine shop. Browse OTC medicines, order
              safely, and track deliveries with ease.
            </p>
          </div>

          {/* Link columns */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p className="text-sm font-semibold">{col.title}</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} className="link-hover">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MediStore. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="#" className="link-hover">
              Privacy
            </Link>
            <Link href="#" className="link-hover">
              Terms
            </Link>
            <Link href="#" className="link-hover">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
