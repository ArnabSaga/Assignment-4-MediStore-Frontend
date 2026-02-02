"use client";

import { createAuthClient } from "better-auth/react";

function resolveAuthBaseURL() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}/api/auth`;

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return `${site.replace(/\/$/, "")}/api/auth`;

  return "http://localhost:3000/api/auth";
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseURL(),
});
