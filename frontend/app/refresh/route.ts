import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

const acceptedEvents = new Set([
  "entry.create",
  "entry.update",
  "entry.delete",
  "entry.publish",
  "entry.unpublish",
]);

const tagsByModel = {
  article: { collection: "articles", item: "article" },
  event: { collection: "events", item: "event" },
  "news-item": { collection: "news", item: "news" },
  "home-page": { collection: "home-page" },
} as const;

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CMS_REVALIDATE_SECRET;
  if (!secret) {
    return new Response("Revalidation is not configured", { status: 503 });
  }
  if (!matchesSecret(request.headers.get("x-revalidate-secret"), secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const tags = tagsForWebhook(payload);
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }
  return Response.json({ revalidated: tags });
}

export function tagsForWebhook(payload: unknown): string[] {
  if (!isRecord(payload) || !acceptedEvents.has(String(payload.event))) {
    return [];
  }

  const model = payload.model;
  if (typeof model !== "string" || !(model in tagsByModel)) {
    return [];
  }

  const mapping = tagsByModel[model as keyof typeof tagsByModel];
  const tags: string[] = [mapping.collection];
  const entry = isRecord(payload.entry) ? payload.entry : undefined;
  const identity =
    entry && isRecord(entry.identity) ? entry.identity : undefined;
  if ("item" in mapping && typeof identity?.slug === "string") {
    tags.push(`${mapping.item}:${identity.slug}`);
  }
  return tags;
}

export function matchesSecret(
  actual: string | null,
  expected: string,
): boolean {
  const actualBytes = Buffer.from(actual ?? "");
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
