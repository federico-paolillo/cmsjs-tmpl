import type { CmsPageDto } from "@cmsjs/cms/model";
import { ArticlePage } from "@cmsjs/components/article-page";
import { EventPage } from "@cmsjs/components/event-page";
import { HomePage } from "@cmsjs/components/home-page";
import { NewsPage } from "@cmsjs/components/news-page";

export function PageSwitch({ page }: { page: CmsPageDto }) {
  switch (page.pageType) {
    case "article":
      return <ArticlePage page={page} />;
    case "event":
      return <EventPage page={page} />;
    case "home-page":
      return <HomePage page={page} />;
    case "news":
      return <NewsPage page={page} />;
    default:
      return assertNever(page);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unknown page: ${JSON.stringify(value)}`);
}
