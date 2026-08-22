import type { EventListItemDto } from "@cmsjs/cms/model";
import Link from "next/link";

export function EventsListPage({ items }: { items: EventListItemDto[] }) {
  return (
    <main>
      <h1>Events</h1>
      <ul>
        {items.map((item) => (
          <li key={item.identity.slug}>
            <Link href={`/events/${item.identity.slug}`}>
              {item.identity.title}
            </Link>
            <p>{item.summary}</p>
            {item.when && <time dateTime={item.when}>{item.when}</time>}
          </li>
        ))}
      </ul>
    </main>
  );
}
