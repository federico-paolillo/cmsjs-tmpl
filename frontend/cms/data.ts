import type {
  ArticleDto,
  ArticleListItemDto,
  EventDto,
  EventListItemDto,
  HomePageDto,
  NewsDto,
  NewsListItemDto,
} from "@cmsjs/cms/model";
import type { Result } from "@cmsjs/cms/result";
import { deps } from "@cmsjs/deps";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDto | null> {
  "use cache";

  cacheLife("days");
  cacheTag("articles", `article:${slug}`);

  const { isEnabled } = await draftMode();

  const result = await deps.connector.getArticleBySlug(
    slug,
    isEnabled ? "draft" : "published",
  );

  return valueOrThrow(result);
}

export async function getEventBySlug(slug: string): Promise<EventDto | null> {
  "use cache";

  cacheLife("days");
  cacheTag("events", `event:${slug}`);

  const result = await deps.connector.getEventBySlug(slug);

  return valueOrThrow(result);
}

export async function getNewsBySlug(slug: string): Promise<NewsDto | null> {
  "use cache";

  cacheLife("days");
  cacheTag("news", `news:${slug}`);

  const { isEnabled } = await draftMode();

  const result = await deps.connector.getNewsBySlug(
    slug,
    isEnabled ? "draft" : "published",
  );

  return valueOrThrow(result);
}

export async function getHomePage(): Promise<HomePageDto | null> {
  "use cache";

  cacheLife("days");
  cacheTag("home-page");

  const result = await deps.connector.getHomePage();

  return valueOrThrow(result);
}

export async function listArticles(): Promise<ArticleListItemDto[]> {
  "use cache";

  cacheLife("days");
  cacheTag("articles");

  const result = await deps.connector.listArticles();

  return listOrThrow(result);
}

export async function listEvents(): Promise<EventListItemDto[]> {
  "use cache";

  cacheLife("days");
  cacheTag("events");

  const result = await deps.connector.listEvents();

  return listOrThrow(result);
}

export async function listNews(): Promise<NewsListItemDto[]> {
  "use cache";

  cacheLife("days");
  cacheTag("news");

  const result = await deps.connector.listNews();

  return listOrThrow(result);
}

function valueOrThrow<T>(result: Result<T>): T | null {
  if (result.ok) {
    return result.value;
  }

  if (result.problem.kind === "not_found") {
    return null;
  }

  throw new Error(result.problem.message, { cause: result.problem });
}

function listOrThrow<T>(result: Result<T[]>): T[] {
  if (result.ok) {
    return result.value;
  }

  if (result.problem.kind === "not_found") {
    return [];
  }

  throw new Error(result.problem.message, { cause: result.problem });
}
