import { getEventBySlug } from "@cmsjs/cms/data";
import { PageSwitch } from "@cmsjs/components/page-switch";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">): Promise<Metadata> {
  const page = await getEventBySlug((await params).slug);
  if (!page) {
    notFound();
  }
  return { title: page.identity.title, description: page.summary };
}

export default async function EventRoute({
  params,
}: PageProps<"/events/[slug]">) {
  const page = await getEventBySlug((await params).slug);
  if (!page) {
    notFound();
  }
  return <PageSwitch page={page} />;
}
