"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        {/* Heading */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground text-balance">
            Enter your email and we’ll send you a password reset link.
          </p>
        </div>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
          <FieldDescription>
            Make sure this email is registered with MediStore.
          </FieldDescription>
        </Field>

        {/* Submit */}
        <Field>
          <Button type="submit" className="w-full btn-primary">
            Send reset link
          </Button>
        </Field>

        {/* Back to login */}
        <Field>
          <p className="text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Back to login
            </Link>
          </p>
        </Field>
      </FieldGroup>
    </form>
  );
}
