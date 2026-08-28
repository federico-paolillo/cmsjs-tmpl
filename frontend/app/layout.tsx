import type { Metadata } from "next";
import "@cmsjs/app/globals.css";
import { defaultMetadata } from "@cmsjs/app/meta";
import { SiteFooter } from "@cmsjs/components/layout/site-footer";
import { SiteHeader } from "@cmsjs/components/layout/site-header";
import { config } from "@cmsjs/config";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
});
const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: config.siteUrl,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={`${geist.variable} ${geistMono.variable}`} lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
