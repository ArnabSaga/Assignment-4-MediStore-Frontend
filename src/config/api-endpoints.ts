/**
 * Centralized API endpoints configuration.
 * Automatically handles switching between local development and production URLs
 * based on the current environment.
 */

import { env } from "@/env";

// Frontend public URLs (accessed via browser)
export const API_CONFIG = {
  // Use http://localhost:5000 if BACKEND_URL isn't set in dev
  backendBaseUrl: env.BACKEND_URL || "http://localhost:5000",

  // Frontend public URLs (accessed via browser)
  frontendUrl: env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",

  apiUrl: env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",

  authUrl: env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000/api/auth",
};

export const endpoints = {
  auth: {
    signIn: `${API_CONFIG.authUrl}/sign-in`,
    signUp: `${API_CONFIG.authUrl}/sign-up`,
    signOut: `${API_CONFIG.authUrl}/sign-out`,
    me: `${API_CONFIG.authUrl}/get-session`,
  },
  v1: {
    medicines: "/medicines",
    categories: "/categories",
    orders: "/orders",
    users: "/users",
    uploads: "/uploads",
  },
};
