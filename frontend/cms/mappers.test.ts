import type { NewsData } from "@cmsjs/cms/client";
import { toNewsDto, toNewsListItemDto } from "@cmsjs/cms/mappers";
import { describe, expect, it } from "vitest";

const listItemRaw = {
  id: 1,
  documentId: "doc-1",
  identity: { slug: "hello-world", title: "Hello World" },
  summary: "A summary",
} as unknown as NewsData;

describe("toNewsListItemDto", () => {
  it("maps a valid news list item", () => {
    const result = toNewsListItemDto(listItemRaw);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.identity.slug).toBe("hello-world");
      expect(result.value.summary).toBe("A summary");
    }
  });

  it("reports a validation problem when the summary is missing", () => {
    const result = toNewsListItemDto({
      ...listItemRaw,
      summary: undefined,
    } as unknown as NewsData);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.problem.kind).toBe("validation");
    }
  });
});

describe("toNewsDto", () => {
  it("normalizes image URLs against the media base URL", () => {
    const raw = {
      id: 1,
      documentId: "doc-1",
      identity: { slug: "hello-world", title: "Hello World" },
      summary: "A summary",
      content: [
        {
          type: "image",
          image: {
            url: "/uploads/photo.jpg",
            width: 100,
            height: 100,
            mime: "image/jpeg",
            alternativeText: "Alt",
          },
        },
      ],
    } as unknown as NewsData;

    const result = toNewsDto(raw, "https://cdn.example.com");

    expect(result.ok).toBe(true);
    if (result.ok) {
      const block = result.value.content[0];
      if (block?.type === "image") {
        expect(block.image.url).toBe(
          "https://cdn.example.com/uploads/photo.jpg",
        );
      }
    }
  });
});
