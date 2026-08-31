import { getArticleBySlug } from "@cmsjs/cms/data";
import { PageSwitch } from "@cmsjs/components/page-switch";
import { PreviewBanner } from "@cmsjs/components/shared/preview-banner";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  const page = await getArticleBySlug(slug);

  if (!page) {
    notFound();
  }

  return { title: page.identity.title };
}

export default async function ArticleRoute({
  params,
}: PageProps<"/articles/[slug]">) {
  const { slug } = await params;

  const page = await getArticleBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <PreviewBanner />
      <PageSwitch page={page} />
    </>
  );
}
