"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/email-verification";
import { getSafeNext } from "@/lib/safe-next";

export default function CheckEmailClient() {
  const sp = useSearchParams();
  const email = sp.get("email") || "";
  const next = getSafeNext(sp.get("next"));

  const [pending, setPending] = React.useState(false);

  const onResend = async () => {
    if (!email || pending) return;

    setPending(true);
    const t = toast.loading("Sending verification email…");

    try {
      await resendVerificationEmail(email, next);
      toast.success("Verification email sent. Please check your inbox.", {
        id: t,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend", {
        id: t,
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4">
      <div className="w-full rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">
            {email || "your email"}
          </span>
          . Please open it to verify your account.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onResend}
            disabled={!email || pending}
          >
            {pending ? "Sending…" : "Resend verification email"}
          </Button>

          <Button asChild className="w-full sm:w-auto">
            <Link href={`/login?next=${encodeURIComponent(next)}`}>
              Go to Login
            </Link>
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Didn&apos;t receive it? Check spam/junk folder or try resending.
        </p>
      </div>
    </main>
  );
}
