// Pure mapping from a Strapi webhook payload to Next.js cache tags.

import { tagsByModel } from "@cmsjs/cms/cache";
import type { WebhookPayload } from "@cmsjs/cms/webhook";

export function tagsForWebhook(payload: WebhookPayload): string[] {
  if (!(payload.model in tagsByModel)) {
    return [];
  }

  const mapping = tagsByModel[payload.model as keyof typeof tagsByModel];

  const tags: string[] = [mapping.collection];

  if (mapping.item) {
    const slug = payload.entry.identity?.slug;

    if (typeof slug === "string") {
      tags.push(`${mapping.item}:${slug}`);
    }
  }

  return tags;
}
