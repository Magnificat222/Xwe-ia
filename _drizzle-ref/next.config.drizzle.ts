import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `npm run verify` compile dans un dossier séparé pour ne pas écraser le
  // .next utilisé par le serveur de développement en cours d'exécution.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  serverExternalPackages: ["pg", "bcryptjs"],
};

export default nextConfig;
