import { getHomePage } from "@cmsjs/cms/data";
import { PageSwitch } from "@cmsjs/components/page-switch";
import { io } from "next/cache";
import { notFound } from "next/navigation";

export default async function HomePage() {
  await io();

  const page = await getHomePage();

  if (!page) {
    notFound();
  }

  return <PageSwitch page={page} />;
}
