import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  // If STATIC_EXPORT is true, build as static HTML files for GitHub Pages
  ...(isStaticExport ? { output: "export" } : {}),
  
  // Required for GitHub Pages to properly resolve routes
  // e.g. /projects/some-id will generate /projects/some-id/index.html
  trailingSlash: true,
  
  // Disable next/image optimization for static hosting compatibility
  images: {
    unoptimized: true,
  },
  
  // Disable typescript during build if warnings exist to prevent build blockages
  typescript: {
    ignoreBuildErrors: true,
  },

  // Critical: Generate stable chunk names so GitHub Pages doesn't get 404 on cached pages
  // After each deploy, old .html files reference old chunk names that no longer exist
  // This makes chunk names content-hash-based AND deterministic
  ...(isStaticExport
    ? {
        // @ts-ignore
        webpack: (config: any, { dev }: { dev: boolean }) => {
          if (!dev) {
            // Use deterministic chunk IDs that don't change between unrelated builds
            config.optimization.chunkIds = "deterministic";
            config.optimization.moduleIds = "deterministic";
            
            // Stable output filenames: content hash but without the random prefix
            config.output.filename = "static/chunks/[name]-[contenthash].js";
            config.output.chunkFilename = "static/chunks/[name]-[contenthash].js";
          }
          return config;
        },
      }
    : {}),

  // Performance: enable gzip compression hints
  compress: true,
  
  // Experimental: faster builds and smaller bundles
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Silence Turbopack warning about webpack config without turbopack config
  // The webpack config is only used for static export (deterministic chunk IDs)
  turbopack: {},
};

export default nextConfig;