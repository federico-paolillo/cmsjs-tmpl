import type { NewsDto } from "@cmsjs/cms/model";
import { Blocks } from "@cmsjs/components/content";

export function NewsPage({ page }: { page: NewsDto }) {
  return (
    <main>
      <article>
        <h1>{page.identity.title}</h1>
        <p>{page.summary}</p>
        <Blocks blocks={page.content} />
      </article>
    </main>
  );
}
