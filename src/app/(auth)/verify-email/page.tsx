import VerifyEmailClient from "@/components/auth/VerifyEmailClient";
import * as React from "react";

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <main className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4">
          <div className="w-full rounded-2xl border bg-card p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold">Verifying your email…</h1>
            <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
          </div>
        </main>
      }
    >
      <VerifyEmailClient />
    </React.Suspense>
  );
}
