import { CmsConnector } from "@cmsjs/cms/connector";
import { EventDto } from "@cmsjs/cms/model";
import { Result } from "@cmsjs/cms/result";
import { PageSwitch } from "@cmsjs/components/page-switch";
import { getDeps } from "@cmsjs/deps";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";

export interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function getEventBySlug(
  connector: CmsConnector,
  slug: string
): Promise<Result<EventDto>> {
  'use cache';

  cacheTag("events", `events:${slug}`);
  cacheLife("days");

  return await connector.getEventBySlug(slug);
}

export default async function EventPage({ params }: EventPageProps) {
  const deps = getDeps();

  const { slug } = await params;

  const eventPageResult = await getEventBySlug(deps.connector, slug);

  if (eventPageResult.ok) {
    return <PageSwitch page={eventPageResult.value} />;
  }

  if (eventPageResult.problem.kind === "not_found") {
    notFound();
  }

  throw eventPageResult.problem;
}