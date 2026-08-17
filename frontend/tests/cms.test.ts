import assert from "node:assert/strict";
import test from "node:test";

import { matchesSecret, tagsForWebhook } from "../app/refresh/route";
import { type ArticleData, makeCmsClient, serializeQuery } from "../cms/client";
import { toArticleDto } from "../cms/mappers";

test("serializes Strapi nested filters and populate", () => {
  const query = serializeQuery({
    filters: { identity: { slug: { $eq: "hello world" } } },
    populate: { sections: { populate: { hero: true } } },
  });
  const params = new URLSearchParams(query);

  assert.equal(params.get("filters[identity][slug][$eq]"), "hello world");
  assert.equal(params.get("populate[sections][populate][hero]"), "true");
});

test("uses content-specific endpoints and Strapi query syntax", async () => {
  const requestedUrls: string[] = [];
  const fetch: typeof globalThis.fetch = async (input) => {
    requestedUrls.push(input instanceof Request ? input.url : String(input));
    return new Response(JSON.stringify({ data: [] }), {
      headers: { "content-type": "application/json" },
    });
  };

  const client = makeCmsClient(fetch, "http://127.0.0.1:1337/api");
  const article = await client.getArticleBySlug("an-article");
  const event = await client.getEventBySlug("summer-party");
  const news = await client.getNewsBySlug("latest-news");
  await client.getHomePage();
  const urls = requestedUrls.map((value) => new URL(value));

  assert.deepEqual(
    urls.map((url) => url.pathname),
    ["/api/articles", "/api/events", "/api/news", "/api/home-page"],
  );
  assert.equal(
    urls[1]?.searchParams.get("filters[identity][slug][$eq]"),
    "summer-party",
  );
  assert.equal(
    urls[0]?.searchParams.get("populate[sections][populate][hero]"),
    "true",
  );
  assert.equal(
    urls[3]?.searchParams.get("populate[content][populate][visual]"),
    "true",
  );
  for (const result of [article, event, news]) {
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.problem.kind, "not_found");
  }
});

test("normalizes nested media URLs at the DTO boundary", () => {
  const raw = {
    identity: { slug: "an-article", title: "An article" },
    sections: [
      {
        header: "Section",
        hero: {
          url: "/uploads/hero.jpg",
          width: 1200,
          height: 600,
          mime: "image/jpeg",
        },
        content: [
          {
            type: "image",
            image: {
              url: "/uploads/body.jpg",
              width: 800,
              height: 400,
              mime: "image/jpeg",
            },
          },
        ],
      },
    ],
  } as unknown as ArticleData;

  const result = toArticleDto(raw, "https://cms.example.com");

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(
    result.value.sections[0]?.hero?.url,
    "https://cms.example.com/uploads/hero.jpg",
  );
  const block = result.value.sections[0]?.content[0];
  assert.equal(
    block?.type === "image" ? block.image.url : undefined,
    "https://cms.example.com/uploads/body.jpg",
  );
});

test("authenticates and bounds webhook invalidation tags", () => {
  assert.equal(matchesSecret("correct", "correct"), true);
  assert.equal(matchesSecret("incorrect", "correct"), false);
  assert.deepEqual(
    tagsForWebhook({
      event: "entry.publish",
      model: "article",
      entry: { identity: { slug: "an-article" } },
    }),
    ["articles", "article:an-article"],
  );
  assert.deepEqual(
    tagsForWebhook({
      event: "entry.unpublish",
      model: "news-item",
      entry: { identity: { slug: "latest-news" } },
    }),
    ["news", "news:latest-news"],
  );
  assert.deepEqual(
    tagsForWebhook({ event: "entry.publish", model: "unknown" }),
    [],
  );
});
