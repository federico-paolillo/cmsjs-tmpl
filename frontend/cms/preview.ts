import { timingSafeCompareSecret } from "@cmsjs/cms/secret";

export type ContentStatus = "draft" | "published";
type PreviewPath = `/articles/${string}` | `/news/${string}`;

export interface PreviewRequest {
  pathname: PreviewPath;
  status: ContentStatus;
}

const previewPaths = new Set(["articles", "news"]);

export function parsePreviewRequest(
  requestUrl: string,
  expectedSecret: string,
): PreviewRequest | null {
  const { searchParams } = new URL(requestUrl);
  const target = searchParams.get("url");
  const status = searchParams.get("status");

  if (
    !timingSafeCompareSecret(searchParams.get("secret"), expectedSecret) ||
    !isContentStatus(status) ||
    !target ||
    target.includes("?") ||
    target.includes("#") ||
    !target.startsWith("/") ||
    target.startsWith("//")
  ) {
    return null;
  }

  const [empty, contentType, encodedSlug, ...rest] = target.split("/");
  if (
    empty !== "" ||
    !contentType ||
    !previewPaths.has(contentType) ||
    !encodedSlug ||
    rest.length > 0
  ) {
    return null;
  }

  try {
    const slug = decodeURIComponent(encodedSlug);
    if (!slug || slug === "." || slug === ".." || /[\\/]/.test(slug)) {
      return null;
    }

    return {
      pathname: `/${contentType}/${encodeURIComponent(slug)}` as PreviewPath,
      status,
    };
  } catch {
    return null;
  }
}

function isContentStatus(value: string | null): value is ContentStatus {
  return value === "draft" || value === "published";
}
