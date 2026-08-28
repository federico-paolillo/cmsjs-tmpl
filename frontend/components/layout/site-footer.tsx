import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <p className="font-mono text-xs tracking-[0.08em] text-muted">
          cmsjs-tmpl
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-muted">
            <li>
              <Link className="hover:text-text" href="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="hover:text-text" href="/news">
                News
              </Link>
            </li>
            <li>
              <Link className="hover:text-text" href="/events">
                Events
              </Link>
            </li>
            <li>
              <Link className="hover:text-text" href="/articles">
                Articles
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
