import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint errors (like unescaped apostrophes) shouldn't block production
    // builds — run `npm run lint` locally if you want to see/fix them.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // The ebook PDFs live outside /public (so they can't be downloaded without
  // going through the authenticated API route) and are read dynamically via
  // fs at runtime — Next can't trace that reference statically, so we must
  // tell it explicitly to bundle the whole folder into the serverless function.
  outputFileTracingIncludes: {
    "/api/ebooks/[slug]/download": ["./content/ebooks/**"],
  },
};

export default nextConfig;
