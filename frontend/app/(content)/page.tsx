import { getHomePage } from "@cmsjs/cms/data";
import { PageSwitch } from "@cmsjs/components/page-switch";
import { notFound } from "next/navigation";

export default async function HomePage() {
  const page = await getHomePage();

  if (!page) {
    notFound();
  }

  return <PageSwitch page={page} />;
}
