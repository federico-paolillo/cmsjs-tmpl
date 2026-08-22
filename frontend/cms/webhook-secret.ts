// Timing-safe comparison for the webhook revalidation secret.

import { timingSafeEqual } from "node:crypto";

export function timingSafeCompareSecrets(
  actual: string | null,
  expected: string,
): boolean {
  const actualBytes = Buffer.from(actual ?? "");
  const expectedBytes = Buffer.from(expected);

  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}
