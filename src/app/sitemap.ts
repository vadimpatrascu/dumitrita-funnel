import type { MetadataRoute } from "next";

/* Change 94: sitemap with proper lastModified date */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://dumitrita-funnel.vercel.app",
      lastModified: new Date("2026-03-19"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
