import type { Metadata } from "next";
import "@cmsjs/app/globals.css";
import { defaultMetadata } from "@cmsjs/app/meta";

export const metadata: Metadata = {
  ...defaultMetadata,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
