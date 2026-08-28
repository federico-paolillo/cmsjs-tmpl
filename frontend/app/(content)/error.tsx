"use client";

export default function ContentError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="font-mono text-xs font-medium tracking-[0.18em] text-accent uppercase">
        Content error
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text">
        Unable to load this page
      </h1>
      <p className="mt-5 text-muted">Please try loading the content again.</p>
      <button
        className="mt-8 rounded-card border border-accent px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={retry}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
