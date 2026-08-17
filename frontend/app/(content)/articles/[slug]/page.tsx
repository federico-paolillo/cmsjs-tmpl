import { getArticleBySlug } from "@cmsjs/cms/data";
import { PageSwitch } from "@cmsjs/components/page-switch";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const page = await getArticleBySlug((await params).slug);
  if (!page) {
    notFound();
  }
  return { title: page.identity.title };
}

export default async function ArticleRoute({
  params,
}: PageProps<"/articles/[slug]">) {
  const page = await getArticleBySlug((await params).slug);
  if (!page) {
    notFound();
  }
  return <PageSwitch page={page} />;
}
