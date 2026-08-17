import { CmsPageDto } from "@cmsjs/cms/model";
import { HomePage } from "@cmsjs/components/home-page";

export interface PageSwitchProps {
  page: CmsPageDto;
}

export function PageSwitch({ page }: PageSwitchProps) {
  switch (page.pageType) {
    case "home-page":
      return <HomePage page={page} />
    default:
      throw new Error(`Unknown page '${page.pageType}'. This is important, contact the administrator`);
  };

}