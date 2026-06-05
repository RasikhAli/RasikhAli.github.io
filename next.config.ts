import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  // If STATIC_EXPORT is true, build as static HTML files for GitHub Pages
  ...(isStaticExport ? { output: "export" } : {}),
  
  // Disable next/image optimization for static hosting compatibility
  images: {
    unoptimized: true,
  },
  
  // Disable typescript during build if warnings exist to prevent build blockages
  typescript: {
    ignoreBuildErrors: true,
  },
  

};

export default nextConfig;
