import type { Metadata } from "next";
import "./globals.css";
import { defaultMetadata } from "./meta";

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
