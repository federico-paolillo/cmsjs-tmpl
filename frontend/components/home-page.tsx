import { HomePageDto } from "@cmsjs/cms/model";

export interface HomePageProps {
  page: HomePageDto;
}

export function HomePage({ page }: HomePageProps) {
  return (
    <h1>{page.title}</h1>
  )
}