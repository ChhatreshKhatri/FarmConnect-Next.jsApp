import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/debug-*", "/test-*"],
    },
    sitemap: `https://farmconnect.chhatreshkhatri.com/sitemap.xml`,
  };
}
