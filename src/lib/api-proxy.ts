/**
 * Shared proxy configuration and header allowlist for MediStore unified transport.
 * Ensures symmetry between /api/auth and /api/v1 proxies.
 */
import { getBackendURL } from "@/lib/backend-url";

/**
 * Headers that are safe and necessary to forward to the backend.
 * Includes auth tokens, content types, and proxy trust chain.
 */
export const ALLOWED_PROXY_HEADERS = [
  "content-type",
  "cookie",
  "authorization",
  "origin",
  "user-agent",
  "referer",
  "accept",
  "accept-language",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
];

/**
 * Headers that should NEVER be forwarded from the backend response to the client.
 * These include hop-by-hop headers and headers that interfere with payload decoding.
 */
export const UNSAFE_RESPONSE_HEADERS = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
];

/**
 * Filters and picks allowed headers from the incoming request.
 */
export const getFilteredProxyHeaders = (headers: Headers): Record<string, string> => {
  const filtered: Record<string, string> = {};
  
  ALLOWED_PROXY_HEADERS.forEach((header) => {
    const value = headers.get(header);
    if (value) {
      filtered[header] = value;
    }
  });

  return filtered;
};

/**
 * Resolves the backend URL from environment variables or throws an error.
 * Used to ensure the proxy is correctly configured at runtime.
 */
export const getBackendUrlOrThrow = (): string => {
  return getBackendURL();
};

export const getPublicProxyError = (error?: unknown): string => {
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    return error.message;
  }

  return "proxy_request_failed";
};

/**
 * Standardized proxy error responses for 500 (misconfig) and 502 (unreachable).
 */
export const createProxyErrorResponse = (
  status: 500 | 502,
  message: string,
  error?: unknown
) => {
  console.error(`[Proxy Error ${status}] ${message}:`, error);
  
  return Response.json(
    { 
      success: false, 
      message: process.env.NODE_ENV === "development"
        ? message
        : "Unable to process the request.",
      error: getPublicProxyError(error)
    },
    { status }
  );
};

export const createBadGatewayResponse = (error?: unknown) => {
  return createProxyErrorResponse(502, "Backend service is currently unreachable.", error);
};

/**
 * Sanitizes response headers from the backend before forwarding them to the client.
 * Strips hop-by-hop and encoding headers to prevent browser decoding errors.
 * Note: set-cookie is handled separately to preserve multiple cookies.
 */
export const sanitizeProxyResponseHeaders = (headers: Headers): Headers => {
  const sanitized = new Headers(headers);
  
  UNSAFE_RESPONSE_HEADERS.forEach((header) => {
    sanitized.delete(header);
  });

  return sanitized;
};
