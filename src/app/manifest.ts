import type { MetadataRoute } from "next";
import id from "@/locales/id.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: id.meta.title,
    short_name: id.meta.title,
    description: id.meta.description,
    lang: "id",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#fafaf9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
