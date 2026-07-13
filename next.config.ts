import type { NextConfig } from "next";
import { getBackendURL } from "./src/lib/backend-url";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendURL = getBackendURL();

    return {
      beforeFiles: [
        {
          source: "/api/auth/:path*",
          destination: `${backendURL}/api/auth/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dsihef3wi/image/upload/**",
      },
    ],
  },
};

export default nextConfig;
