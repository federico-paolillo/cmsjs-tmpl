import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../../cms-api.json", import.meta.url);
const document = JSON.parse(await readFile(path, "utf8"));

function removeGeneratedDateDefaults(value, key) {
  if (!value || typeof value !== "object") return;
  if (key === "publishedAt") delete value.default;
  for (const [childKey, child] of Object.entries(value)) {
    removeGeneratedDateDefaults(child, childKey);
  }
}

removeGeneratedDateDefaults(document);
await writeFile(path, `${JSON.stringify(document, null, 2)}\n`);
