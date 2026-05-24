import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/login", "/auth/"],
      },
    ],
    sitemap: "https://venuees.in/sitemap.xml",
    host: "https://venuees.in",
  };
}
