import type { CmsPageDto } from "@cmsjs/cms/model";
import { ArticlePage } from "@cmsjs/components/articles/page";
import { EventPage } from "@cmsjs/components/events/page";
import { HomePage } from "@cmsjs/components/home/page";
import { NewsPage } from "@cmsjs/components/news/page";

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
      return <></>;
  }
}
