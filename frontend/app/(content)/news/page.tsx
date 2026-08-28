import { listNews } from "@cmsjs/cms/data";
import { NewsListPage } from "@cmsjs/components/news/list-page";
import type { Metadata } from "next";
import { io } from "next/cache";

export const metadata: Metadata = { title: "News" };

export default async function NewsIndexRoute() {
  await io();

  const items = await listNews();

  return <NewsListPage items={items} />;
}
