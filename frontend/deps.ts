import "server-only";

import { makeCmsClient } from "@cmsjs/cms/client";
import { type CmsConnector, makeCmsConnector } from "@cmsjs/cms/connector";

export interface Deps {
  connector: CmsConnector;
}

export function makeDeps(): Deps {
  const cmsUrl = httpUrl(
    process.env.CMS_URL ?? "http://127.0.0.1:1337/api",
    "CMS_URL",
  );
  const mediaUrl = httpUrl(
    process.env.CMS_MEDIA_URL ?? cmsUrl.origin,
    "CMS_MEDIA_URL",
  );

  return Object.freeze({
    connector: makeCmsConnector(
      makeCmsClient(globalThis.fetch, cmsUrl.href, process.env.CMS_API_TOKEN),
      mediaUrl.href,
    ),
  });
}

let serverDeps: Deps | undefined;

export function getDeps(): Deps {
  serverDeps ??= makeDeps();
  return serverDeps;
}

function httpUrl(value: string, name: string): URL {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must use http or https`);
  }
  return url;
}
