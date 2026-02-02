"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterClient() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  return <RegisterForm next={next} />;
}
