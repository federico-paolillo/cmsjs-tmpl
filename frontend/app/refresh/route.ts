import { tagsForWebhook } from "@cmsjs/cms/tags";
import {
  parseWebhookPayload,
  timingSafeCompareWebhookSecret,
  type WebhookPayload,
} from "@cmsjs/cms/webhook";
import { config } from "@cmsjs/config";
import { revalidateTag } from "next/cache";

const acceptedEvents = new Set([
  "entry.create",
  "entry.update",
  "entry.delete",
  "entry.publish",
  "entry.unpublish",
]);

export async function POST(request: Request): Promise<Response> {
  const expectedSecretHeader = config.cmsWebhooksSecretHeader;
  const expectedSecretValue = config.cmsWebhooksSecretHeaderValue;

  if (!expectedSecretHeader) {
    return new Response("Revalidation is not configured properly", {
      status: 503,
    });
  }

  if (!expectedSecretValue) {
    return new Response("Revalidation is not configured properly", {
      status: 503,
    });
  }

  const providedHeaderValue = request.headers.get(`x-${expectedSecretHeader}`);

  if (
    !timingSafeCompareWebhookSecret(providedHeaderValue, expectedSecretValue)
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: WebhookPayload;

  try {
    const parsed = parseWebhookPayload(await request.json());

    if (!parsed) {
      return new Response("Invalid JSON", { status: 400 });
    }

    payload = parsed;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.event === "trigger-test") {
    return new Response("Test successfull", { status: 201 });
  }

  if (!acceptedEvents.has(payload.event)) {
    return new Response("Unsupported event", { status: 400 });
  }

  const tags = tagsForWebhook(payload);

  for (const tag of tags) {
    revalidateTag(tag, "days");
  }

  return Response.json({ revalidated: tags });
}
