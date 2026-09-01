// Glue between the raw Strapi client and the frontend-oriented DTOs.

import type { CmsClient } from "@cmsjs/cms/client";
import {
  toArticleDto,
  toArticleListItemDto,
  toEventDto,
  toEventListItemDto,
  toHomePageDto,
  toNewsDto,
  toNewsListItemDto,
} from "@cmsjs/cms/mappers";
import type {
  ArticleDto,
  ArticleListItemDto,
  EventDto,
  EventListItemDto,
  HomePageDto,
  NewsDto,
  NewsListItemDto,
} from "@cmsjs/cms/model";
import type { ContentStatus } from "@cmsjs/cms/preview";
import { ok, type Result } from "@cmsjs/cms/result";

export interface CmsConnector {
  getArticleBySlug(
    slug: string,
    status: ContentStatus,
  ): Promise<Result<ArticleDto>>;
  getEventBySlug(slug: string): Promise<Result<EventDto>>;
  getNewsBySlug(slug: string, status: ContentStatus): Promise<Result<NewsDto>>;
  getHomePage(): Promise<Result<HomePageDto>>;
  listArticles(): Promise<Result<ArticleListItemDto[]>>;
  listEvents(): Promise<Result<EventListItemDto[]>>;
  listNews(): Promise<Result<NewsListItemDto[]>>;
}

export function makeCmsConnector(
  client: CmsClient,
  mediaBaseUrl: string,
): CmsConnector {
  const connector: CmsConnector = {
    getArticleBySlug: (slug, status) =>
      mapSingle(client.getArticleBySlug(slug, status), (data) =>
        toArticleDto(data, mediaBaseUrl, status),
      ),
    getEventBySlug: (slug) =>
      mapSingle(client.getEventBySlug(slug), (data) =>
        toEventDto(data, mediaBaseUrl),
      ),
    getNewsBySlug: (slug, status) =>
      mapSingle(client.getNewsBySlug(slug, status), (data) =>
        toNewsDto(data, mediaBaseUrl, status),
      ),
    getHomePage: () =>
      mapSingle(client.getHomePage(), (data) =>
        toHomePageDto(data, mediaBaseUrl),
      ),
    listArticles: () => mapList(client.listArticles(), toArticleListItemDto),
    listEvents: () => mapList(client.listEvents(), toEventListItemDto),
    listNews: () => mapList(client.listNews(), toNewsListItemDto),
  };
  return Object.freeze(connector);
}

async function mapSingle<T, D>(
  resultPromise: Promise<Result<T>>,
  map: (value: T) => Result<D>,
): Promise<Result<D>> {
  const result = await resultPromise;

  if (result.ok) {
    return map(result.value);
  }

  return result;
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
    const mappedItem = map(item);
    if (!mappedItem.ok) {
      return mappedItem;
    }
    mapped.push(mappedItem.value);
  }

  return ok(mapped);
}
