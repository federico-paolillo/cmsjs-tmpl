// Lightweight result type for CMS operations. No monads, no classes.

export interface ResourceRef {
  resource: string;
  slug?: string;
  id?: string;
}

export type NetworkCause = "fetch_failed" | "aborted" | "timeout";

export type Problem =
  | {
      kind: "not_found";
      message: string;
      cause: ResourceRef;
      metadata: ResourceRef;
    }
  | {
      kind: "http";
      message: string;
      cause: number;
      metadata: ResourceRef;
      underlying?: Error;
    }
  | {
      kind: "network";
      message: string;
      cause: NetworkCause;
      metadata: ResourceRef;
      underlying: Error;
    }
  | {
      kind: "parse";
      message: string;
      cause: "invalid_json";
      metadata: ResourceRef;
      underlying: Error;
    }
  | {
      kind: "validation";
      message: string;
      cause: readonly string[];
      metadata: ResourceRef;
    }
  | {
      kind: "unexpected";
      message: string;
      metadata: ResourceRef;
      underlying: Error;
    };

export type Result<T> =
  | { readonly ok: true; readonly value: T; readonly problem?: never }
  | { readonly ok: false; readonly value?: never; readonly problem: Problem };

export function ok<T>(value: T): Result<T> {
  return Object.freeze({ ok: true as const, value });
}

export function err(problem: Problem): Result<never> {
  return Object.freeze({ ok: false as const, problem: Object.freeze(problem) });
}

export function notFound(metadata: ResourceRef): Result<never> {
  return err({
    kind: "not_found",
    message: notFoundMessage(metadata),
    cause: metadata,
    metadata,
  });
}

export function httpError(
  status: number,
  metadata: ResourceRef,
  underlying?: Error,
): Result<never> {
  return err({
    kind: "http",
    message: `Request to ${metadata.resource} failed with status ${status}`,
    cause: status,
    metadata,
    ...(underlying ? { underlying } : {}),
  });
}

export function networkError(
  metadata: ResourceRef,
  underlying: unknown,
): Result<never> {
  const error = toError(underlying);
  return err({
    kind: "network",
    message: `Request to ${metadata.resource} failed: ${error.message}`,
    cause: classifyNetworkCause(error),
    metadata,
    underlying: error,
  });
}

export function parseError(
  metadata: ResourceRef,
  underlying: unknown,
): Result<never> {
  const error = toError(underlying);
  return err({
    kind: "parse",
    message: `Failed to parse response from ${metadata.resource}`,
    cause: "invalid_json",
    metadata,
    underlying: error,
  });
}

export function unexpectedError(
  metadata: ResourceRef,
  underlying: unknown,
): Result<never> {
  const error = toError(underlying);
  return err({
    kind: "unexpected",
    message: `Unexpected error fetching ${metadata.resource}: ${error.message}`,
    metadata,
    underlying: error,
  });
}

export function validationError(
  metadata: ResourceRef,
  cause: string[],
): Result<never> {
  return err({
    kind: "validation",
    message: `Invalid payload from ${metadata.resource}: ${cause.join(", ")}`,
    cause: Object.freeze(cause),
    metadata,
  });
}

function notFoundMessage(metadata: ResourceRef): string {
  if (metadata.slug) {
    return `No ${metadata.resource} found for slug "${metadata.slug}"`;
  }
  if (metadata.id) {
    return `No ${metadata.resource} found for id "${metadata.id}"`;
  }
  return `No ${metadata.resource} found`;
}

function classifyNetworkCause(error: Error): NetworkCause {
  if (error.name === "AbortError") {
    return "aborted";
  }
  const message = error.message.toLowerCase();
  if (message.includes("timeout") || message.includes("timed out")) {
    return "timeout";
  }
  return "fetch_failed";
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
