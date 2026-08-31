import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CogniCare CDTx — AI Memory Care Platform",
    short_name: "CogniCare",
    description:
      "AI-powered cognitive digital therapeutics and memory assistance platform for elderly dementia patients in North East India. Proposed for MDoNER (SIH26003).",
    start_url: "/en",
    display: "standalone",
    background_color: "#FAF6F0",
    theme_color: "#15803D",
    orientation: "portrait",
    categories: ["medical", "health", "games", "education"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
