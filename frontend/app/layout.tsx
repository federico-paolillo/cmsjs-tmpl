import type { Metadata } from "next";
import "@cmsjs/app/globals.css";
import { defaultMetadata } from "@cmsjs/app/meta";
import { SiteFooter } from "@cmsjs/components/site-footer";
import { SiteHeader } from "@cmsjs/components/site-header";
import { config } from "@cmsjs/config";

export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: config.siteUrl,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
