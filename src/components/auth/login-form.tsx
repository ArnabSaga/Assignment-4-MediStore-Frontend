"use client";

import Link from "next/link";
import * as React from "react";
import * as z from "zod";

import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resendVerificationEmail } from "@/lib/email-verification";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Minimum length is 8"),
});

type LoginFormProps = React.ComponentProps<"form"> & {
  next?: string;
};

function extractAuthErrorMessage(error: unknown) {
  if (!error) return "Login failed";

  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const e = error as Record<string, unknown>;

    if (typeof e.message === "string" && e.message.trim()) {
      return e.message;
    }

    if (typeof e.error === "string" && e.error.trim()) {
      return e.error;
    }

    if (typeof e.statusText === "string" && e.statusText.trim()) {
      return e.statusText;
    }

    if (
      e.cause &&
      typeof e.cause === "object" &&
      "message" in e.cause &&
      typeof (e.cause as { message?: unknown }).message === "string"
    ) {
      return (e.cause as { message: string }).message;
    }
  }

  return "Login failed";
}

export function LoginForm({ className, next = "/", ...props }: LoginFormProps) {
  const [pending, setPending] = React.useState(false);
  const [notVerifiedEmail, setNotVerifiedEmail] = React.useState<string | null>(null);
  const [resendPending, setResendPending] = React.useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      setNotVerifiedEmail(null);

      const toastId = toast.loading("Logging in...");

      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        console.log("login result:", result);

        const message = extractAuthErrorMessage(result?.error);
        const lower = message.toLowerCase();

        if (result?.error) {
          if (
            lower.includes("verify") ||
            lower.includes("not verified") ||
            lower.includes("email verification")
          ) {
            setNotVerifiedEmail(value.email);
            toast.error("Please verify your email first.", { id: toastId });
            return;
          }

          toast.error(message, { id: toastId });
          return;
        }

        toast.success("Welcome back to MediStore", { id: toastId });
        window.location.href = next;
      } catch (error) {
        const message = extractAuthErrorMessage(error);
        toast.error(message, { id: toastId });
        console.error("login exception:", error);
      } finally {
        setPending(false);
      }
    },
  });

  const handleGoogleLogin = async () => {
    if (pending) return;
    setPending(true);

    try {
      const callbackURL = new URL(next, window.location.origin).toString();

      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (error) {
      toast.error(extractAuthErrorMessage(error));
      setPending(false);
    }
  };

  const handleResend = async () => {
    if (!notVerifiedEmail || resendPending) return;

    setResendPending(true);
    const t = toast.loading("Sending verification email...");

    try {
      await resendVerificationEmail(notVerifiedEmail, next);
      toast.success("Verification email sent. Please check your inbox.", {
        id: t,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resend email", {
        id: t,
      });
    } finally {
      setResendPending(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login to MediStore</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to continue.
          </p>
        </div>

        {notVerifiedEmail ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <p className="font-medium">Email not verified</p>
            <p className="text-muted-foreground">
              We blocked login because your email is not verified yet.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleResend}
                disabled={resendPending}
              >
                {resendPending ? "Sending..." : "Resend verification email"}
              </Button>

              <Button asChild type="button" variant="ghost">
                <Link
                  href={`/check-email?email=${encodeURIComponent(
                    notVerifiedEmail
                  )}&next=${encodeURIComponent(next)}`}
                >
                  Open verification help
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        <form.Field name="email">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  disabled={pending}
                />
                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  disabled={pending}
                />

                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <Button type="submit" disabled={pending}>
          {pending ? "Logging in..." : "Login"}
        </Button>

        <div className="relative text-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>

        <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={pending}>
          Continue with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4">
            Register
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
