export const contentCacheProfile = "days";

export const tagsByModel = {
  article: { collection: "articles", item: "article" },
  event: { collection: "events", item: "event" },
  "news-item": { collection: "news", item: "news" },
  "home-page": { collection: "home-page", item: null },
} as const;
