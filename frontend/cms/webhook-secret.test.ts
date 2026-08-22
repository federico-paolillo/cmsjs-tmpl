import { timingSafeCompareSecrets } from "@cmsjs/cms/webhook-secret";
import { describe, expect, it } from "vitest";

describe("timingSafeCompareSecrets", () => {
  it("returns true for equal secrets", () => {
    expect(timingSafeCompareSecrets("secret-value", "secret-value")).toBe(true);
  });

  it("returns false for different secrets", () => {
    expect(timingSafeCompareSecrets("wrong", "secret-value")).toBe(false);
  });

  it("returns false for a null provided value", () => {
    expect(timingSafeCompareSecrets(null, "secret-value")).toBe(false);
  });

  it("returns false for secrets of different lengths", () => {
    expect(timingSafeCompareSecrets("short", "a-longer-secret")).toBe(false);
  });
});
