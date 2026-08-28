import { listArticles } from "@cmsjs/cms/data";
import { ArticlesListPage } from "@cmsjs/components/articles/list-page";
import type { Metadata } from "next";
import { io } from "next/cache";

export const metadata: Metadata = { title: "Articles" };

export default async function ArticlesIndexRoute() {
  await io();

  const items = await listArticles();

  return <ArticlesListPage items={items} />;
}
