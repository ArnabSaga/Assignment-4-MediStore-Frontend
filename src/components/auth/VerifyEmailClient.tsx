"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailClient() {
  const router = useRouter();
  const sp = useSearchParams();

  React.useEffect(() => {
    const token = sp.get("token");
    const next = sp.get("next") || "/";

    if (!token) {
      router.replace(`/login?error=${encodeURIComponent("Missing token")}`);
      return;
    }

    const callbackURL = new URL(next, window.location.origin).toString();

    const verifyURL = `/api/auth/verify-email?token=${encodeURIComponent(
      token
    )}&callbackURL=${encodeURIComponent(callbackURL)}`;

    window.location.replace(verifyURL);
  }, [sp, router]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4">
      <div className="w-full rounded-2xl border bg-card p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Verifying your email…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait. We&apos;re confirming your email address.
        </p>
      </div>
    </main>
  );
}
