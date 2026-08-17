// Glue between the raw Strapi CmsClient and the frontend-oriented DTOs. Fetches
// Strapi-specific models via CmsClient, maps them to @cmsjs-tmpl DTOs and
// returns them as Result<T>.

import type { CmsClient } from "./client";
import {
  toContactDto,
  toEventDto,
  toHomePageDto,
  toNewsDto,
  toPageDto,
} from "./mappers";
import type {
  ContactDto,
  EventDto,
  HomePageDto,
  NewsDto,
  PageDto,
} from "./model";
import { ok, type Result } from "./result";

export interface CmsConnector {
  getPages(slug?: string): Promise<Result<PageDto[]>>;
  getPage(id: string): Promise<Result<PageDto>>;
  getPageBySlug(slug: string): Promise<Result<PageDto>>;

  getEvents(slug?: string): Promise<Result<EventDto[]>>;
  getEvent(id: string): Promise<Result<EventDto>>;
  getEventBySlug(slug: string): Promise<Result<EventDto>>;

  getNews(id: string): Promise<Result<NewsDto>>;
  getNewses(slug?: string): Promise<Result<NewsDto[]>>;
  getNewsBySlug(slug: string): Promise<Result<NewsDto>>;

  getHomePage(): Promise<Result<HomePageDto>>;
  getContact(): Promise<Result<ContactDto>>;
}

export function makeCmsConnector(client: CmsClient): CmsConnector {
  const connector: CmsConnector = {
    getPages: (slug) => mapList(client.getPages(slug), toPageDto),
    getPage: (id) => mapSingle(client.getPage(id), toPageDto),
    getPageBySlug: (slug) => mapSingle(client.getPageBySlug(slug), toPageDto),

    getEvents: (slug) => mapList(client.getEvents(slug), toEventDto),
    getEvent: (id) => mapSingle(client.getEvent(id), toEventDto),
    getEventBySlug: (slug) =>
      mapSingle(client.getEventBySlug(slug), toEventDto),

    getNews: (id) => mapSingle(client.getNews(id), toNewsDto),
    getNewses: (slug) => mapList(client.getNewses(slug), toNewsDto),
    getNewsBySlug: (slug) => mapSingle(client.getNewsBySlug(slug), toNewsDto),

    getHomePage: () => mapSingle(client.getHomePage(), toHomePageDto),

    getContact: () => mapSingle(client.getContact(), toContactDto),
  };

  return Object.freeze(connector);
}

async function mapSingle<T, D>(
  resultPromise: Promise<Result<T>>,
  map: (value: T) => Result<D>,
): Promise<Result<D>> {
  const result = await resultPromise;
  if (!result.ok) {
    return result;
  }
  return map(result.value);
}

async function mapList<T, D>(
  resultPromise: Promise<Result<T[]>>,
  map: (value: T) => Result<D>,
): Promise<Result<D[]>> {
  const result = await resultPromise;
  if (!result.ok) {
    return result;
  }
  const mapped: D[] = [];
  for (const item of result.value) {
    const parsed = map(item);
    if (!parsed.ok) {
      return parsed;
    }
    mapped.push(parsed.value);
  }
  return ok(Object.freeze(mapped) as D[]);
}
