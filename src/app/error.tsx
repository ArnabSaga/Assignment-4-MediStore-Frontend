"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10">
        <Card className="w-full border-border bg-card text-card-foreground shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <CardTitle className="text-2xl md:text-3xl">
                Something went wrong
              </CardTitle>
            </div>
            <CardDescription>
              An unexpected error occurred while loading this page.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <p className="text-sm text-muted-foreground">Error message:</p>
              <p className="mt-1 wrap-break-word text-sm">
                {error.message || "Unknown error"}
              </p>

              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={reset} className="btn-primary">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try again
              </Button>

              <Button asChild variant="outline" className="btn-outline">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to home
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If this problem keeps happening, it may be related to API errors,
              authentication state, or route protection.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
