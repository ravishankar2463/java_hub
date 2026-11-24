import type { MetadataRoute } from "next";
import { getStaticBasePath } from "@/lib/site-paths.mjs";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = getStaticBasePath();
  const startUrl = `${basePath}/` || "/";

  return {
    name: "JavaHub",
    short_name: "JavaHub",
    description:
      "The Java Mastery Roadmap: 16 levels and 116 topics, available online and offline.",
    start_url: startUrl,
    scope: startUrl,
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      {
        src: `${basePath}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
