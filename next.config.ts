import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // A foto passa pela Server Action antes de ir ao backend (limite de 5 MB
      // lá); a folga cobre o overhead do multipart e os campos de texto.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Fotos das peças: servidas pelo próprio front em /imagens (proxy para o backend).
    localPatterns: [{ pathname: "/imagens/**", search: "" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
