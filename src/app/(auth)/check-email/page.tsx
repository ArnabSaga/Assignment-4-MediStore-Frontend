import CheckEmailClient from "@/components/auth/CheckEmailClient";
import * as React from "react";

export default function Page() {
  return (
    <React.Suspense
      fallback={
        <main className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4">
          <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
            <h1 className="text-xl font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
          </div>
        </main>
      }
    >
      <CheckEmailClient />
    </React.Suspense>
  );
}
