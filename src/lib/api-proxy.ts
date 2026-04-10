/**
 * Shared proxy configuration and header allowlist for MediStore unified transport.
 * Ensures symmetry between /api/auth and /api/v1 proxies.
 */

/**
 * Headers that are safe and necessary to forward to the backend.
 * Includes auth tokens, content types, and proxy trust chain.
 */
export const ALLOWED_PROXY_HEADERS = [
  "content-type",
  "cookie",
  "authorization",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
  "user-agent",
  "referer",
  "accept",
  "accept-language",
  "accept-encoding",
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
 * Standardized 502 Bad Gateway response for unreachable backends.
 */
export const createBadGatewayResponse = (error?: unknown) => {
  console.error("[Proxy] Backend unreachable or failed:", error);
  
  return Response.json(
    { 
      success: false, 
      message: "Backend service is currently unreachable.",
      error: Error.name 
    },
    { status: 502 }
  );
};
