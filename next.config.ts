import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static export for Cloudflare Pages
  trailingSlash: true,  // Recommended for static hosting
  images: {
    unoptimized: true  // Required for static export
  }
};

export default nextConfig;
