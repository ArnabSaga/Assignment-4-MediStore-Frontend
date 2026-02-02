"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as z from "zod";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resendVerificationEmail } from "@/lib/email-verification";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Minimum length is 8"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [pending, setPending] = React.useState(false);
  const [notVerifiedEmail, setNotVerifiedEmail] = React.useState<string | null>(
    null
  );
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

      const toastId = toast.loading("Logging in…");

      try {
        const { error } = await authClient.signIn.email(value);

        if (error) {
          const msg = error.message ?? "Login failed";
          const msgLower = msg.toLowerCase();

          if (
            msgLower.includes("verify") ||
            msgLower.includes("not verified")
          ) {
            setNotVerifiedEmail(value.email);
            toast.error("Please verify your email first. Check your inbox.", {
              id: toastId,
            });
          } else {
            toast.error(msg, { id: toastId });
          }
          return;
        }

        toast.success("Welcome back to MediStore 💊", { id: toastId });
        router.refresh();
        router.push(next);
      } catch {
        toast.error("Something went wrong, please try again.", { id: toastId });
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
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setPending(false);
    }
  };

  const handleResend = async () => {
    if (!notVerifiedEmail || resendPending) return;

    setResendPending(true);
    const t = toast.loading("Sending verification email…");
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Login to MediStore
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to continue.
          </p>
        </div>

        {notVerifiedEmail ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <p className="font-medium">Email not verified</p>
            <p className="text-muted-foreground">
              We blocked login because your email isn’t verified.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleResend}
                disabled={resendPending}
              >
                {resendPending ? "Sending…" : "Resend verification email"}
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
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

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
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

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
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  disabled={pending}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
              </Field>
            );
          }}
        </form.Field>

        <Field>
          <Button
            type="submit"
            className="btn-primary w-full"
            disabled={pending}
          >
            {pending ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="btn-outline w-full"
            disabled={pending}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>

          <FieldDescription className="mt-3 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register?next=${encodeURIComponent(next)}`}
              className="underline underline-offset-4"
            >
              Register
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
