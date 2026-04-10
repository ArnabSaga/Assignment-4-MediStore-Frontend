"use client";

import { env } from "@/env";
import { createAuthClient } from "better-auth/react";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getFrontendOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  if (env.NEXT_PUBLIC_FRONTEND_URL) {
    return trimTrailingSlash(env.NEXT_PUBLIC_FRONTEND_URL);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${trimTrailingSlash(process.env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${trimTrailingSlash(process.env.VERCEL_URL)}`;
  }

  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: `${getFrontendOrigin()}/api/auth`,
});
