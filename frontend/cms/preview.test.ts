import { parsePreviewRequest } from "@cmsjs/cms/preview";
import { timingSafeCompareSecret } from "@cmsjs/cms/secret";
import { describe, expect, it } from "vitest";

const secret = "preview-test-secret";

function requestUrl(url: string, status = "draft", value = secret): string {
  const request = new URL("https://frontend.example/preview");
  request.searchParams.set("url", url);
  request.searchParams.set("status", status);
  request.searchParams.set("secret", value);
  return request.href;
}

describe("parsePreviewRequest", () => {
  it("returns canonical Article and News paths for valid requests", () => {
    expect(
      parsePreviewRequest(requestUrl("/articles/draft%20article"), secret),
    ).toEqual({
      pathname: "/articles/draft%20article",
      status: "draft",
    });
    expect(
      parsePreviewRequest(requestUrl("/news/published", "published"), secret),
    ).toEqual({
      pathname: "/news/published",
      status: "published",
    });
  });

  it("rejects invalid credentials and statuses", () => {
    expect(timingSafeCompareSecret(secret, secret)).toBe(true);
    expect(timingSafeCompareSecret("wrong", secret)).toBe(false);
    expect(timingSafeCompareSecret(null, secret)).toBe(false);
    expect(timingSafeCompareSecret("short", secret)).toBe(false);
    expect(
      parsePreviewRequest(
        "https://frontend.example/preview?url=%2Farticles%2Fexample&status=draft",
        secret,
      ),
    ).toBeNull();
    expect(
      parsePreviewRequest(
        "https://frontend.example/preview?url=%2Farticles%2Fexample&secret=preview-test-secret",
        secret,
      ),
    ).toBeNull();
    expect(
      parsePreviewRequest(requestUrl("/articles/example", "invalid"), secret),
    ).toBeNull();
    expect(
      parsePreviewRequest(
        requestUrl("/articles/example", "draft", "wrong"),
        secret,
      ),
    ).toBeNull();
  });

  it.each([
    "https://attacker.example/path",
    "//attacker.example/path",
    "/events/example",
    "/articles",
    "/articles/",
    "/articles/example/extra",
    "/articles/.",
    "/articles/..",
    "/articles/%2E%2E",
    "/articles/slash%2Fvalue",
    "/articles/backslash%5Cvalue",
    "/articles/example?redirect=/",
    "/articles/example#fragment",
    "/articles/%",
  ])("rejects unsafe target %s", (target) => {
    expect(parsePreviewRequest(requestUrl(target), secret)).toBeNull();
  });
});
