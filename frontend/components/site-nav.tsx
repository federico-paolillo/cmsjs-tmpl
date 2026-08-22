import Link from "next/link";

// Placeholder navigation — extend with the site's actual page structure.
export function SiteNav() {
  return (
    <nav aria-label="Main">
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/news">News</Link>
        </li>
        <li>
          <Link href="/events">Events</Link>
        </li>
        <li>
          <Link href="/articles">Articles</Link>
        </li>
      </ul>
    </nav>
  );
}
