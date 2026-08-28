import { listEvents } from "@cmsjs/cms/data";
import { EventsListPage } from "@cmsjs/components/events/list-page";
import type { Metadata } from "next";
import { io } from "next/cache";

export const metadata: Metadata = { title: "Events" };

export default async function EventsIndexRoute() {
  await io();

  const items = await listEvents();

  return <EventsListPage items={items} />;
}
