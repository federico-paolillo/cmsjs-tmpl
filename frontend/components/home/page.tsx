import type { HomePageDto } from "@cmsjs/cms/model";
import { Hero } from "@cmsjs/components/shared/content";

export function HomePage({ page }: { page: HomePageDto }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-mono text-xs font-medium tracking-[0.18em] text-accent uppercase">
        cmsjs-tmpl
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-text sm:text-6xl">
        {page.title}
      </h1>
      <div className="mt-12 space-y-16 sm:mt-16">
        {page.content.map((hero, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Strapi components have no ID in the frontend DTO and never reorder client-side.
          <Hero hero={hero} key={index} />
        ))}
      </div>
    </main>
  );
}
