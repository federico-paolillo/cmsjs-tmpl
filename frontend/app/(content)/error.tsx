"use client";

export default function ContentError({ retry }: { retry: () => void }) {
  return (
    <main>
      <h1>Unable to load this page</h1>
      <button onClick={retry} type="button">
        Try again
      </button>
    </main>
  );
}
