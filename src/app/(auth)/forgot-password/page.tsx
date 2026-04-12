import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Image from "next/image";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Logo */}
        <div className="flex items-center justify-center lg:justify-start">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-border bg-card">
              <Image
                src="/icons/logo.png"
                alt="MediStore"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                priority
              />
            </span>
            <span className="font-semibold tracking-tight">
              Medi<span className="text-muted-foreground">Store</span>
            </span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>

      {/* Right image */}
      <div className="relative hidden lg:block overflow-hidden bg-muted">
        <Image
          src="/images/hero-section-image.jpg"
          alt="Healthcare"
          fill
          sizes="100vw"
          className="object-cover dark:brightness-[0.25]"
        />
      </div>
    </div>
  );
}
