import { timingSafeEqual } from "node:crypto";

export function timingSafeCompareSecret(
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
