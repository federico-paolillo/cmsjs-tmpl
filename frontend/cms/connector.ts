// Glue between the raw Strapi client and the frontend-oriented DTOs.

import type { CmsClient } from "./client";
import { toArticleDto, toEventDto, toHomePageDto, toNewsDto } from "./mappers";
import type { ArticleDto, EventDto, HomePageDto, NewsDto } from "./model";
import type { Result } from "./result";

export interface CmsConnector {
  getArticleBySlug(slug: string): Promise<Result<ArticleDto>>;
  getEventBySlug(slug: string): Promise<Result<EventDto>>;
  getNewsBySlug(slug: string): Promise<Result<NewsDto>>;
  getHomePage(): Promise<Result<HomePageDto>>;
}

export function makeCmsConnector(
  client: CmsClient,
  mediaBaseUrl: string,
): CmsConnector {
  const connector: CmsConnector = {
    getArticleBySlug: (slug) =>
      mapSingle(client.getArticleBySlug(slug), (data) =>
        toArticleDto(data, mediaBaseUrl),
      ),
    getEventBySlug: (slug) =>
      mapSingle(client.getEventBySlug(slug), (data) =>
        toEventDto(data, mediaBaseUrl),
      ),
    getNewsBySlug: (slug) =>
      mapSingle(client.getNewsBySlug(slug), (data) =>
        toNewsDto(data, mediaBaseUrl),
      ),
    getHomePage: () =>
      mapSingle(client.getHomePage(), (data) =>
        toHomePageDto(data, mediaBaseUrl),
      ),
  };
  return Object.freeze(connector);
}

async function mapSingle<T, D>(
  resultPromise: Promise<Result<T>>,
  map: (value: T) => Result<D>,
): Promise<Result<D>> {
  const result = await resultPromise;
  return result.ok ? map(result.value) : result;
}
