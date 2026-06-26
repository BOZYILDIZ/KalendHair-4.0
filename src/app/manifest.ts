import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KalendHair",
    short_name: "KalendHair",
    description:
      "Logiciel de gestion pour salons de coiffure. Agenda, réservation en ligne, CRM clients, caisse et stocks.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#4f46e5",
    lang: "fr",
    // Icons will be added to public/ when brand assets are finalized
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
