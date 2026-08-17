import type {
  ArticleDto,
  EventDto,
  HomePageDto,
  NewsDto,
} from "@cmsjs/cms/model";
import type { Result } from "@cmsjs/cms/result";
import { getDeps } from "@cmsjs/deps";
import { cacheLife, cacheTag } from "next/cache";

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDto | null> {
  "use cache";
  cacheLife("days");
  cacheTag("articles", `article:${slug}`);
  return valueOrThrow(await getDeps().connector.getArticleBySlug(slug));
}

export async function getEventBySlug(slug: string): Promise<EventDto | null> {
  "use cache";
  cacheLife("days");
  cacheTag("events", `event:${slug}`);
  return valueOrThrow(await getDeps().connector.getEventBySlug(slug));
}

export async function getNewsBySlug(slug: string): Promise<NewsDto | null> {
  "use cache";
  cacheLife("days");
  cacheTag("news", `news:${slug}`);
  return valueOrThrow(await getDeps().connector.getNewsBySlug(slug));
}

export async function getHomePage(): Promise<HomePageDto | null> {
  "use cache";
  cacheLife("days");
  cacheTag("home-page");
  return valueOrThrow(await getDeps().connector.getHomePage());
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
