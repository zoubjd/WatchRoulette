import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/**" },
      { protocol: "https", hostname: "a.ltrbxd.com", pathname: "/**" },
      { protocol: "https", hostname: "letterboxd.com", pathname: "/**" },
      { protocol: "https", hostname: "s.ltrbxd.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
