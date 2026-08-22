import { listArticles, listEvents, listNews } from "@cmsjs/cms/data";
import { config } from "@cmsjs/config";
import type { MetadataRoute } from "next";
import { connection } from "next/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const [articles, events, news] = await Promise.all([
    listArticles(),
    listEvents(),
    listNews(),
  ]);

  const base = config.siteUrl.href.replace(/\/$/, "");

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...articles.map((item) => ({
      url: `${base}/articles/${item.identity.slug}`,
      changeFrequency: "monthly" as const,
    })),
    ...events.map((item) => ({
      url: `${base}/events/${item.identity.slug}`,
      changeFrequency: "weekly" as const,
    })),
    ...news.map((item) => ({
      url: `${base}/news/${item.identity.slug}`,
      changeFrequency: "weekly" as const,
    })),
  ];
}
