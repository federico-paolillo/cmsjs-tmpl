"use client";

import "@cmsjs/app/globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <title>Application error | cmsjs-tmpl</title>
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-accent uppercase">
            Application error
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text">
            Unable to load the site
          </h1>
          <p className="mt-5 text-muted">Please try again.</p>
          <button
            className="mt-8 w-fit rounded-card border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={retry}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
