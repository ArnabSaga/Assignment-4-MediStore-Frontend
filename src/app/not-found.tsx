import Link from "next/link";
import { Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10">
        <Card className="w-full border-border bg-card text-card-foreground shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                <Search className="h-4 w-4" />
              </span>
              <CardTitle className="text-2xl md:text-3xl">
                Page not found
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              The medicine you&apos;re looking for may be unavailable or
              discontinued.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-sm text-muted-foreground">
                Error code: <span className="text-foreground">404</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                If you typed the address, double-check it. Otherwise, use one of
                the actions below.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="btn-primary">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to home
                </Link>
              </Button>

              <Button asChild variant="outline" className="btn-outline">
                <Link href="/shop">
                  <Search className="mr-2 h-4 w-4" />
                  Browse medicines
                </Link>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Tip: If you think this is a mistake, check your route protection
              (middleware) or role-based layouts.
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
