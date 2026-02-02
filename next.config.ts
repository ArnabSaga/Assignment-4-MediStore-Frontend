import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    const backend = process.env.BACKEND_URL;

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backend}/api/auth/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
