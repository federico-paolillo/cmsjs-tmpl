import { makeCmsClient, serializeQuery } from "@cmsjs/cms/client";
import { describe, expect, it } from "vitest";

describe("serializeQuery", () => {
  it("encodes nested objects as bracketed keys", () => {
    expect(serializeQuery({ populate: { identity: true } })).toBe(
      "populate%5Bidentity%5D=true",
    );
  });

  it("encodes the Strapi list query shape", () => {
    expect(
      serializeQuery({
        status: "published",
        pagination: { pageSize: 100 },
        sort: "publishedAt:desc",
      }),
    ).toBe(
      "status=published&pagination%5BpageSize%5D=100&sort=publishedAt%3Adesc",
    );
  });

  it("omits undefined and null values", () => {
    expect(serializeQuery({ a: undefined, b: null, c: "x" })).toBe("c=x");
  });

  it("has collection methods populate identity directly", async () => {
    const urls: URL[] = [];
    const fetch: typeof globalThis.fetch = async (input) => {
      const request = input instanceof Request ? input : new Request(input);
      urls.push(new URL(request.url));
      return Response.json({ data: [] });
    };
    const client = makeCmsClient(fetch, "http://localhost:1337/api", null);

    await client.listArticles();
    await client.listEvents();
    await client.listNews();

    expect(urls.map(({ pathname }) => pathname)).toEqual([
      "/api/articles",
      "/api/events",
      "/api/news",
    ]);
    for (const url of urls) {
      expect(url.searchParams.get("populate[identity]")).toBe("true");
      expect(url.searchParams.has("populate[populate][identity]")).toBe(false);
    }
  });
});
