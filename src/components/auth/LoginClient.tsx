"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginClient() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  return <LoginForm next={next} />;
}
