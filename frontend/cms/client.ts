import type { paths } from "@cmsjs/cms/schema";
import type { Client } from "openapi-fetch";
import createClient from "openapi-fetch";

import {
  httpError,
  networkError,
  notFound,
  ok,
  parseError,
  type ResourceRef,
  type Result,
} from "./result";

// Raw Strapi 5 client that returns Strapi-specific types

export type ArticleData =
  paths["/articles"]["get"]["responses"][200]["content"]["application/json"]["data"][number];
export type EventData =
  paths["/events"]["get"]["responses"][200]["content"]["application/json"]["data"][number];
export type NewsData =
  paths["/news"]["get"]["responses"][200]["content"]["application/json"]["data"][number];
export type HomePageData =
  paths["/home-page"]["get"]["responses"][200]["content"]["application/json"]["data"];

export interface CmsClient {
  getArticleBySlug(slug: string): Promise<Result<ArticleData>>;
  getEventBySlug(slug: string): Promise<Result<EventData>>;
  getNewsBySlug(slug: string): Promise<Result<NewsData>>;
  getHomePage(): Promise<Result<HomePageData>>;
}

export function makeCmsClient(
  fetch: typeof globalThis.fetch,
  baseUrl: string,
  token?: string,
): CmsClient {
  const rawClient = createClient<paths>({
    baseUrl,
    fetch,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    querySerializer: serializeQuery,
  });

  const client: CmsClient = {
    getArticleBySlug: (slug) => getArticleBySlug(rawClient, slug),
    getEventBySlug: (slug) => getEventBySlug(rawClient, slug),
    getNewsBySlug: (slug) => getNewsBySlug(rawClient, slug),
    getHomePage: () => getHomePage(rawClient),
  };
  return Object.freeze(client);
}

async function getArticleBySlug(
  rawClient: Client<paths>,
  slug: string,
): Promise<Result<ArticleData>> {
  const result = await toResult(
    rawClient.GET("/articles", {
      params: {
        query: contentQuery(slug, {
          identity: true,
          sections: { populate: { hero: true } },
        }),
      },
    }),
    { resource: "article", slug },
  );
  if (!result.ok) {
    return result;
  }
  const article = result.value[0];
  return article ? ok(article) : notFound({ resource: "article", slug });
}

async function getEventBySlug(
  rawClient: Client<paths>,
  slug: string,
): Promise<Result<EventData>> {
  const result = await toResult(
    rawClient.GET("/events", {
      params: { query: contentQuery(slug, { identity: true }) },
    }),
    { resource: "event", slug },
  );
  if (!result.ok) {
    return result;
  }
  const event = result.value[0];
  return event ? ok(event) : notFound({ resource: "event", slug });
}

async function getNewsBySlug(
  rawClient: Client<paths>,
  slug: string,
): Promise<Result<NewsData>> {
  const result = await toResult(
    rawClient.GET("/news", {
      params: { query: contentQuery(slug, { identity: true }) },
    }),
    { resource: "news", slug },
  );
  if (!result.ok) {
    return result;
  }
  const news = result.value[0];
  return news ? ok(news) : notFound({ resource: "news", slug });
}

async function getHomePage(
  rawClient: Client<paths>,
): Promise<Result<HomePageData>> {
  return toResult(
    rawClient.GET("/home-page", {
      params: {
        query: deepQuery({
          populate: { content: { populate: { visual: true } } },
        }),
      },
    }),
    { resource: "home-page" },
  );
}

async function toResult<T>(
  resultPromise: Promise<{ data?: { data: T }; response: Response }>,
  metadata: ResourceRef,
): Promise<Result<T>> {
  try {
    const result = await resultPromise;
    if (result.data !== undefined) {
      return ok(result.data.data);
    }
    if (result.response.status === 404) {
      return notFound(metadata);
    }
    return httpError(result.response.status, metadata);
  } catch (underlying) {
    if (underlying instanceof SyntaxError) {
      return parseError(metadata, underlying);
    }
    return networkError(metadata, underlying);
  }
}

function contentQuery(slug: string, populate: unknown): never {
  return deepQuery({
    status: "published",
    populate,
    filters: { identity: { slug: { $eq: slug } } },
  });
}

// Strapi uses qs-style brackets, which OpenAPI cannot describe deeply enough.
function deepQuery(query: Record<string, unknown>): never {
  return query as never;
}

export function serializeQuery(query: Record<string, unknown>): string {
  const params = new URLSearchParams();

  function append(path: string, value: unknown): void {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      for (const [index, item] of value.entries()) {
        append(`${path}[${index}]`, item);
      }
      return;
    }
    if (typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        append(path ? `${path}[${key}]` : key, item);
      }
      return;
    }
    params.append(path, String(value));
  }

  for (const [key, value] of Object.entries(query)) {
    append(key, value);
  }
  return params.toString();
}
