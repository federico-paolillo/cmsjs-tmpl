import { EventDto } from "@cmsjs/cms/model";

export interface EventPageProps {
  page: EventDto;
}

export function HomePage({ page }: EventPageProps) {
  return (
    <h1>{page.identity?.title}</h1>
  )
}