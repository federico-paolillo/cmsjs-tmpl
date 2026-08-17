"use client"; // Error boundaries must be Client Components

import { Metadata } from "next";
import { defaultMetadata } from "./meta";

export const metadata: Metadata = {
  ...defaultMetadata,
};

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body className="bg-black">
        <main>
          <h1 className="text-white">Error</h1>
          <p className="text-red-500">Well...The website failed completely !</p>
        </main>
      </body>
    </html>
  );
}
