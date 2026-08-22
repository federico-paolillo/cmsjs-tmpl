import { tagsForWebhook } from "@cmsjs/cms/tags";
import type { WebhookPayload } from "@cmsjs/cms/webhook";
import { describe, expect, it } from "vitest";

function payload(model: string, slug?: string): WebhookPayload {
  return {
    event: "entry.update",
    createdAt: "2026-01-01T00:00:00.000Z",
    model,
    entry: slug
      ? { id: 1, identity: { slug, title: "Hello World" } }
      : { id: 1 },
  };
}

describe("tagsForWebhook", () => {
  it("always returns the collection tag for a known model", () => {
    expect(tagsForWebhook(payload("news-item"))).toEqual(["news"]);
  });

  it("adds the item tag, without a space, when the entry exposes a slug", () => {
    expect(tagsForWebhook(payload("news-item", "hello-world"))).toEqual([
      "news",
      "news:hello-world",
    ]);
  });

  it("returns no tags for an unknown model", () => {
    expect(tagsForWebhook(payload("unknown-model", "x"))).toEqual([]);
  });
});
