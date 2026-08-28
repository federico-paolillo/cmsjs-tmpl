import type { EventDto } from "@cmsjs/cms/model";
import { Blocks } from "@cmsjs/components/shared/content";

export function EventPage({ page }: { page: EventDto }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <article>
        <p className="font-mono text-xs font-medium tracking-[0.18em] text-accent uppercase">
          Event
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          {page.identity.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted">{page.summary}</p>
        {page.when && (
          <time
            className="mt-6 block font-mono text-sm text-accent"
            dateTime={page.when}
          >
            {page.when}
          </time>
        )}
        <div className="mt-12">
          <Blocks blocks={page.content} />
        </div>
      </article>
    </main>
  );
}
