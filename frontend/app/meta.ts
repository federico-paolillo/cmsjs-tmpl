import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: {
    default: "CMS Template",
    template: "%s | CMS Template",
  },
  other: {
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "development",
  },
};
