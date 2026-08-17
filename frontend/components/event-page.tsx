import type { EventDto } from "@cmsjs/cms/model";
import { Blocks } from "@cmsjs/components/content";

export function EventPage({ page }: { page: EventDto }) {
  return (
    <main>
      <article>
        <h1>{page.identity.title}</h1>
        <p>{page.summary}</p>
        {page.when && <time dateTime={page.when}>{page.when}</time>}
        <Blocks blocks={page.content} />
      </article>
    </main>
  );
}
