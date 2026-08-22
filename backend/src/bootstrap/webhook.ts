import type { Core } from "@strapi/strapi";

const WEBHOOK_NAME = "Next.js revalidation";

const WEBHOOK_EVENTS = [
  "entry.create",
  "entry.update",
  "entry.delete",
  "entry.publish",
  "entry.unpublish",
];

export async function ensureNextJsWebhook(strapi: Core.Strapi): Promise<void> {
  const baseUrl = process.env.WEBHOOKS_NEXTJS_TARGET;

  if (!baseUrl) {
    strapi.log.warn(
      "Skipping Next.js webhook creation: WEBHOOKS_NEXTJS_TARGET is not set.",
    );
    return;
  }

  const url = new URL("/refresh", baseUrl).toString();
  const webhookStore = strapi.get("webhookStore");

  const existing = await webhookStore.findWebhooks();

  if (existing) {
    const match = existing.find((webhook: { url: string }) => webhook.url === url);

    if (match) {
      strapi.get("webhookRunner").add(match);
      return;
    }
  }

  const webhook = await webhookStore.createWebhook({
    name: WEBHOOK_NAME,
    url,
    headers: {},
    events: WEBHOOK_EVENTS,
  });

  strapi.get("webhookRunner").add(webhook);

  strapi.log.info(`Created Next.js revalidation webhook: ${url}`);
}
