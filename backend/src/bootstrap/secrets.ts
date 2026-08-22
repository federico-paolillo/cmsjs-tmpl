import { readFileSync } from "node:fs";

function readSecretFile(path: string): string {
  const value = readFileSync(path, "utf8").trim();

  if (!value) {
    throw new Error(`Secret file is empty: ${path}`);
  }

  return value;
}

export function resolveSecret(envName: string): string | null {
  const filePath = process.env[`${envName}_FILE`];

  if (filePath) {
    return readSecretFile(filePath);
  }

  return process.env[envName] ?? null;
}
