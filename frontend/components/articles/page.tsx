import type { ArticleDto } from "@cmsjs/cms/model";
import { Section } from "@cmsjs/components/shared/content";

export function ArticlePage({ page }: { page: ArticleDto }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <article>
        <p className="font-mono text-xs font-medium tracking-[0.18em] text-accent uppercase">
          Article
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          {page.identity.title}
        </h1>
        <div className="mt-12 space-y-12">
          {page.sections.map((section, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Strapi components have no ID in the frontend DTO and never reorder client-side.
            <Section key={index} section={section} />
          ))}
        </div>
      </article>
    </main>
  );
}
