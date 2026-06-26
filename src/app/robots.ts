import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/login",
          "/book",
          "/api",
          "/contact/merci",
        ],
      },
    ],
    sitemap: "https://kalendhair.fr/sitemap.xml",
    host: "https://kalendhair.fr",
  };
}
