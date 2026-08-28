import type { NewsDto } from "@cmsjs/cms/model";
import { Blocks } from "@cmsjs/components/shared/content";

export function NewsPage({ page }: { page: NewsDto }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <article>
        <p className="font-mono text-xs font-medium tracking-[0.18em] text-accent uppercase">
          News
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          {page.identity.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">{page.summary}</p>
        <div className="mt-12">
          <Blocks blocks={page.content} />
        </div>
      </article>
    </main>
  );
}
