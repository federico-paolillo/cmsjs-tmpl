import type { NextConfig } from "next";

const mediaUrl = new URL(
  process.env.CMS_MEDIA_URL ?? process.env.CMS_URL ?? "http://127.0.0.1:1337",
);
if (mediaUrl.protocol !== "http:" && mediaUrl.protocol !== "https:") {
  throw new Error("CMS_MEDIA_URL must use http or https");
}
const protocol = mediaUrl.protocol.slice(0, -1) as "http" | "https";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol,
        hostname: mediaUrl.hostname,
        port: mediaUrl.port,
        pathname: "/**",
        search: "",
      },
    ],
  },
  experimental: {
    typedEnv: true,
  },
};

export default nextConfig;
