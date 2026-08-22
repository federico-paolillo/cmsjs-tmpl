import type { ArticleListItemDto } from "@cmsjs/cms/model";
import Link from "next/link";

export function ArticlesListPage({ items }: { items: ArticleListItemDto[] }) {
  return (
    <main>
      <h1>Articles</h1>
      <ul>
        {items.map((item) => (
          <li key={item.identity.slug}>
            <Link href={`/articles/${item.identity.slug}`}>
              {item.identity.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
