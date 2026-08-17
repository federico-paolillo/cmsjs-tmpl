import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { setTimeout as delay } from "node:timers/promises";

const cms = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:1338");
  const slug = url.searchParams.get("filters[identity][slug][$eq]");
  const data = {
    "/api/home-page": { title: "Home", content: [] },
    "/api/articles":
      slug === "an-article"
        ? [
            {
              identity: { slug, title: "Article" },
              sections: [{ content: [] }],
            },
          ]
        : [],
    "/api/events":
      slug === "summer-party"
        ? [
            {
              identity: { slug, title: "Event" },
              summary: "Summary",
              content: [],
            },
          ]
        : [],
    "/api/news":
      slug === "latest-news"
        ? [
            {
              identity: { slug, title: "News" },
              summary: "Summary",
              content: [],
            },
          ]
        : [],
  }[url.pathname];

  response.writeHead(data === undefined ? 404 : 200, {
    "content-type": "application/json",
  });
  response.end(JSON.stringify({ data }));
});

await new Promise((resolve) => cms.listen(1338, "127.0.0.1", resolve));
const next = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  {
    env: {
      ...process.env,
      CMS_URL: "http://127.0.0.1:1338/api",
      CMS_MEDIA_URL: "http://127.0.0.1:1338",
    },
    stdio: "inherit",
  },
);

try {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:3100");
      await response.text();
      if (response.ok) break;
    } catch {}
    await delay(250);
  }

  for (const [path, title] of [
    ["/", "Home"],
    ["/articles/an-article", "Article"],
    ["/events/summer-party", "Event"],
    ["/news/latest-news", "News"],
  ]) {
    const response = await fetch(`http://127.0.0.1:3100${path}`);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(`>${title}<`), path);
  }
  const missing = await fetch("http://127.0.0.1:3100/articles/missing-article");
  assert.match(await missing.text(), /Page not found/);
} finally {
  next.kill();
  cms.close();
  await Promise.race([once(next, "exit"), delay(5_000)]);
}
