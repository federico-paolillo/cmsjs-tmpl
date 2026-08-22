import { config } from "@cmsjs/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = config.siteUrl.href.replace(/\/$/, "");

  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
  };
}
