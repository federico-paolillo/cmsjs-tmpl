"use client";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <title>Application error</title>
        <main>
          <h1>Unable to load the site</h1>
          <button onClick={retry} type="button">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
