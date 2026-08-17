import { CmsConnector, makeCmsConnector } from "@cmsjs/cms/connector";
import { makeCmsClient } from "@cmsjs/cms/client";

export interface Deps {
  connector: CmsConnector;
}

export function makeDeps(): Deps {
  const compositionRoot = {
    connector: makeCmsConnector(
      makeCmsClient(
        globalThis.fetch,
        process.env.NEXT_PUBLIC_CMS_URL
      )
    )
  };

  return Object.freeze(compositionRoot);
}

let serverDeps: Deps | null = null;

export function getDeps(): Deps {
  serverDeps ??= makeDeps();
  return serverDeps;
}