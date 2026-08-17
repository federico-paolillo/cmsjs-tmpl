import type { ArticleDto } from "@cmsjs/cms/model";
import { Section } from "@cmsjs/components/content";

export function ArticlePage({ page }: { page: ArticleDto }) {
  return (
    <main>
      <article>
        <h1>{page.identity.title}</h1>
        {page.sections.map((section, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Strapi components have no ID in the frontend DTO and never reorder client-side.
          <Section key={index} section={section} />
        ))}
      </article>
    </main>
  );
}
