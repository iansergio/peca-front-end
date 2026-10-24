import type { MetadataRoute } from "next";

/** Cores do DS (docs/Cores.png): marca e fundo-pagina. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PEÇA - Marketplace de peças de celular",
    short_name: "PEÇA",
    description: "Um marketplace simples e direto para quem compra, vende ou procura peças e celulares.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#125155",
    lang: "pt-BR",
    // icon1/icon2 são gerados do mesmo desenho do "Ícone do app" (app/icon.svg).
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon1.png", sizes: "192x192", type: "image/png" },
      { src: "/icon2.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
