import type { HomePageDto } from "@cmsjs/cms/model";
import { Hero } from "@cmsjs/components/content";

export function HomePage({ page }: { page: HomePageDto }) {
  return (
    <main>
      <h1>{page.title}</h1>
      {page.content.map((hero, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Strapi components have no ID in the frontend DTO and never reorder client-side.
        <Hero hero={hero} key={index} />
      ))}
    </main>
  );
}
