/**
 * Centralized API endpoints configuration.
 * Adheres to the unified same-origin proxy architecture.
 * Browsers use relative paths (/api/...) while SSR handles origin resolution via headers.
 */

export const endpoints = {
  auth: {
    // Relative to frontend origin
    base: "/api/auth",
    session: "/api/auth/get-session",
    verifyEmail: "/api/auth/verify-email",
    sendVerificationEmail: "/api/auth/send-verification-email",
  },
  v1: {
    // Relative to frontend origin via /api/v1 proxy
    medicines: "/medicines",
    categories: "/categories",
    orders: "/orders",
    users: "/users",
    uploads: "/uploads",
    analytics: "/analytics",
  },
};
