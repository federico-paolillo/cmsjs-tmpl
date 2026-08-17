import { Metadata } from "next";

export const defaultMetadata: Metadata = {
  other: {
    version: String(process.env.NEXT_PUBLIC_APP_VERSION),
  },
};
