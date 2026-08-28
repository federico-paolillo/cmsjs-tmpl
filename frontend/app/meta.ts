import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: {
    default: "cmsjs-tmpl",
    template: "%s | cmsjs-tmpl",
  },
  other: {
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "development",
  },
};
