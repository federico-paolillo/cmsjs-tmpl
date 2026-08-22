import type { NewsListItemDto } from "@cmsjs/cms/model";
import Link from "next/link";

export function NewsListPage({ items }: { items: NewsListItemDto[] }) {
  return (
    <main>
      <h1>News</h1>
      <ul>
        {items.map((item) => (
          <li key={item.identity.slug}>
            <Link href={`/news/${item.identity.slug}`}>
              {item.identity.title}
            </Link>
            <p>{item.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
