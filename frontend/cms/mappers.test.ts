import type { ArticleData, NewsData } from "@cmsjs/cms/client";
import { toArticleDto, toNewsDto, toNewsListItemDto } from "@cmsjs/cms/mappers";
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

    const result = toNewsDto(raw, "https://cdn.example.com", "published");

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

  it("normalizes incomplete drafts without weakening published validation", () => {
    const raw = {
      id: 1,
      documentId: "doc-1",
      identity: { slug: "hello-world", title: null },
      summary: null,
      content: null,
    } as unknown as NewsData;

    const draft = toNewsDto(raw, "https://cdn.example.com", "draft");

    expect(draft.ok).toBe(true);
    if (draft.ok) {
      expect(draft.value.identity.title).toBe("");
      expect(draft.value.summary).toBe("");
      expect(draft.value.content).toEqual([]);
    }
    expect(toNewsDto(raw, "https://cdn.example.com", "published").ok).toBe(
      false,
    );
  });
});

describe("toArticleDto", () => {
  it("normalizes incomplete drafts without weakening payload validation", () => {
    const raw = {
      id: 1,
      documentId: "doc-1",
      identity: { slug: "hello-world", title: null },
      sections: [{ header: "Draft section", content: null }],
    } as unknown as ArticleData;

    const draft = toArticleDto(raw, "https://cdn.example.com", "draft");

    expect(draft.ok).toBe(true);
    if (draft.ok) {
      expect(draft.value.identity.title).toBe("");
      expect(draft.value.sections[0]?.content).toEqual([]);
    }
    expect(toArticleDto(raw, "https://cdn.example.com", "published").ok).toBe(
      false,
    );
    expect(
      toArticleDto(
        { ...raw, sections: [{ content: {} }] } as unknown as ArticleData,
        "https://cdn.example.com",
        "draft",
      ).ok,
    ).toBe(false);
  });

  it("normalizes missing draft sections", () => {
    const result = toArticleDto(
      {
        id: 1,
        documentId: "doc-1",
        identity: { slug: "hello-world", title: "Hello World" },
        sections: null,
      } as unknown as ArticleData,
      "https://cdn.example.com",
      "draft",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sections).toEqual([]);
    }
  });
});
