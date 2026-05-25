import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tank Identifier",
    short_name: "Tanks",
    description:
      "Browse military tanks and aircraft, view specifications, and compare vehicles.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0c0a09",
    theme_color: "#0c0a09",
    categories: ["education", "utilities"],
    icons: [
      {
        src: "/logo.png",
        sizes: "350x350",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "350x350",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
