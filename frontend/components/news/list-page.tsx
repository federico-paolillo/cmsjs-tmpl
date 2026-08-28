import type { NewsListItemDto } from "@cmsjs/cms/model";
import { EmptyState } from "@cmsjs/components/shared/empty-state";
import Link from "next/link";

export function NewsListPage({ items }: { items: NewsListItemDto[] }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-mono text-xs font-medium tracking-[0.18em] text-accent uppercase">
        Updates
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
        News
      </h1>
      {items.length === 0 ? (
        <EmptyState label="news items" />
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.identity.slug}>
              <Link
                className="group flex h-full min-h-48 flex-col rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                href={`/news/${item.identity.slug}`}
              >
                <span className="text-xl font-medium text-text group-hover:text-accent">
                  {item.identity.title}
                </span>
                <span className="mt-3 text-sm leading-6 text-muted">
                  {item.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
