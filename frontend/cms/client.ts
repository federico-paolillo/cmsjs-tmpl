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

export type PageData =
  paths["/pages"]["get"]["responses"][200]["content"]["application/json"]["data"][number];
export type EventData =
  paths["/events"]["get"]["responses"][200]["content"]["application/json"]["data"][number];
export type NewsData =
  paths["/newses"]["get"]["responses"][200]["content"]["application/json"]["data"][number];
export type HomePageData =
  paths["/home-page"]["get"]["responses"][200]["content"]["application/json"]["data"];
export type ContactData =
  paths["/contact"]["get"]["responses"][200]["content"]["application/json"]["data"];

export interface CmsClient {
  getPages(slug?: string): Promise<Result<PageData[]>>;
  getPage(id: string): Promise<Result<PageData>>;
  getPageBySlug(slug: string): Promise<Result<PageData>>;

  getEvents(slug?: string): Promise<Result<EventData[]>>;
  getEvent(id: string): Promise<Result<EventData>>;
  getEventBySlug(slug: string): Promise<Result<EventData>>;

  getNews(id: string): Promise<Result<NewsData>>;
  getNewses(slug?: string): Promise<Result<NewsData[]>>;
  getNewsBySlug(slug: string): Promise<Result<NewsData>>;

  getHomePage(): Promise<Result<HomePageData>>;

  getContact(): Promise<Result<ContactData>>;
}

export function makeCmsClient(
  fetch: typeof globalThis.fetch,
  baseUrl: string,
): CmsClient {
  const rawClient = createClient<paths>({ baseUrl, fetch });

  const cmsClient: CmsClient = {
    getPages: (slug) => listPages(rawClient, slug),
    getPage: (id) => getPageById(rawClient, id),
    getPageBySlug: (slug) => getPageBySlug(rawClient, slug),

    getEvents: (slug) => listEvents(rawClient, slug),
    getEvent: (id) => getEventById(rawClient, id),
    getEventBySlug: (slug) => getEventBySlug(rawClient, slug),

    getNews: (id) => getNewsById(rawClient, id),
    getNewses: (slug) => listNewses(rawClient, slug),
    getNewsBySlug: (slug) => getNewsBySlug(rawClient, slug),

    getHomePage: () => getHomePage(rawClient),

    getContact: () => getContact(rawClient),
  };

  return Object.freeze(cmsClient);
}

async function listPages(
  rawClient: Client<paths>,
  slug?: string,
): Promise<Result<PageData[]>> {
  return toResult(
    rawClient.GET("/pages", {
      params: {
        query: {
          status: "published",
          populate: "*",
          filters: slugToFilter(slug),
        },
      },
    }),
    { resource: "page", slug },
  );
}

async function getPageById(
  rawClient: Client<paths>,
  id: string,
): Promise<Result<PageData>> {
  return toResult(
    rawClient.GET("/pages/{id}", {
      params: { path: { id }, query: { status: "published", populate: "*" } },
    }),
    { resource: "page", id },
  );
}

async function getPageBySlug(
  rawClient: Client<paths>,
  slug: string,
): Promise<Result<PageData>> {
  const result = await toResult(
    rawClient.GET("/pages", {
      params: {
        query: {
          status: "published",
          populate: "*",
          filters: slugToFilter(slug),
        },
      },
    }),
    { resource: "page", slug },
  );
  if (!result.ok) {
    return result;
  }
  const page = result.value[0];
  return page ? ok(page) : notFound({ resource: "page", slug });
}

async function listEvents(
  rawClient: Client<paths>,
  slug?: string,
): Promise<Result<EventData[]>> {
  return toResult(
    rawClient.GET("/events", {
      params: {
        query: {
          status: "published",
          populate: "*",
          filters: slugToFilter(slug),
        },
      },
    }),
    { resource: "event", slug },
  );
}

async function getEventById(
  rawClient: Client<paths>,
  id: string,
): Promise<Result<EventData>> {
  return toResult(
    rawClient.GET("/events/{id}", {
      params: { path: { id }, query: { status: "published", populate: "*" } },
    }),
    { resource: "event", id },
  );
}

async function getEventBySlug(
  rawClient: Client<paths>,
  slug: string,
): Promise<Result<EventData>> {
  const result = await toResult(
    rawClient.GET("/events", {
      params: {
        query: {
          status: "published",
          populate: "*",
          filters: slugToFilter(slug),
        },
      },
    }),
    { resource: "event", slug },
  );
  if (!result.ok) {
    return result;
  }
  const event = result.value[0];
  return event ? ok(event) : notFound({ resource: "event", slug });
}

async function listNewses(
  rawClient: Client<paths>,
  slug?: string,
): Promise<Result<NewsData[]>> {
  return toResult(
    rawClient.GET("/newses", {
      params: {
        query: {
          status: "published",
          populate: "*",
          filters: slugToFilter(slug),
        },
      },
    }),
    { resource: "news", slug },
  );
}

async function getNewsById(
  rawClient: Client<paths>,
  id: string,
): Promise<Result<NewsData>> {
  return toResult(
    rawClient.GET("/newses/{id}", {
      params: { path: { id }, query: { status: "published", populate: "*" } },
    }),
    { resource: "news", id },
  );
}

async function getNewsBySlug(
  rawClient: Client<paths>,
  slug: string,
): Promise<Result<NewsData>> {
  const result = await toResult(
    rawClient.GET("/newses", {
      params: {
        query: {
          status: "published",
          populate: "*",
          filters: slugToFilter(slug),
        },
      },
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
    rawClient.GET("/home-page", { params: { query: { populate: "*" } } }),
    { resource: "home-page" },
  );
}

async function getContact(
  rawClient: Client<paths>,
): Promise<Result<ContactData>> {
  return toResult(
    rawClient.GET("/contact", { params: { query: { populate: "*" } } }),
    { resource: "contact" },
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

function slugToFilter(
  slug?: string,
): { identity: { slug: { $eq: string } } } | undefined {
  return slug ? { identity: { slug: { $eq: slug } } } : undefined;
}
