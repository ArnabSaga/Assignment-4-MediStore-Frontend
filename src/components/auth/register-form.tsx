"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const formSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(8, "Minimum 8 characters"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormProps = React.ComponentProps<"form"> & {
  next?: string;
};

export function RegisterForm({
  className,
  next = "/",
  ...props
}: RegisterFormProps) {
  const router = useRouter();

  const [pending, setPending] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setPending(true);
      const toastId = toast.loading("Creating account…");

      try {
        const { confirmPassword, ...payload } = value;
        const { error } = await authClient.signUp.email(payload);

        if (error) {
          toast.error(error.message ?? "Signup failed", { id: toastId });
          return;
        }

        toast.success("Account created successfully 🎉", { id: toastId });

        router.refresh();
        router.push(
          `/check-email?email=${encodeURIComponent(
            payload.email
          )}&next=${encodeURIComponent(next)}`
        );

        form.reset();
      } catch {
        toast.error("Something went wrong. Please try again.", { id: toastId });
      } finally {
        setPending(false);
      }
    },
  });

  const handleGoogle = async () => {
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
            Create your MediStore account
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign up to start using MediStore.
          </p>
        </div>

        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field>
                <FieldLabel>Full name</FieldLabel>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="John Doe"
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

        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={pending}
                />
                {isInvalid ? (
                  <FieldError errors={field.state.meta.errors} />
                ) : null}
                <FieldDescription>
                  We’ll only use this to contact you.
                </FieldDescription>
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
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="new-password"
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

        <form.Field name="confirmPassword">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field>
                <FieldLabel>Confirm password</FieldLabel>
                <Input
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="new-password"
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

        <Button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </Button>

        <FieldSeparator>Or</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            className="w-full"
            type="button"
            onClick={handleGoogle}
            disabled={pending}
          >
            Continue with Google
          </Button>

          <FieldDescription className="mt-3 text-center">
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="underline underline-offset-4"
            >
              Login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
