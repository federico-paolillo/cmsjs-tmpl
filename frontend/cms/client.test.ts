import { serializeQuery } from "@cmsjs/cms/client";
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
});
