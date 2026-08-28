# Strapi 5 + Next.js showcase template

A reusable foundation for read-only (or low-interaction) showcase websites — company
sites, football-team pages, parishes, and the like. A Strapi 5 backend serves content;
a Next.js 16 frontend renders it. This template is meant to be extended by a coding
agent or developer into a complete, styled site.

## Rendering model

The frontend is **SSR + ISR**. Content is fetched on demand through a
[Cache Components](https://nextjs.org/docs) pipeline (`"use cache"`, `cacheLife`,
`cacheTag`) and revalidated on content changes via a Strapi webhook that calls
`app/refresh/route.ts` (`revalidateTag`).

The template is intentionally **not** a static (SSG) site: there is no
`generateStaticParams`, no static export, and no build-time prerendering of content.
Pages are rendered on the server and cached for a `days` profile; edits in Strapi
invalidate the affected cache tags.

## Presentation examples

The bundled styles and components demonstrate one complete presentation; they
are not design laws or presentation assets to reuse as-is. Adapt the target
site's visual language while preserving the SSR + ISR model, CMS pipeline, and
route/component ownership conventions in `AGENTS.md`.

## Environment variables

The backend reads `backend/.env` (see `backend/.env.example`). The frontend reads
`frontend/.env*` (see `frontend/.env.example`). The frontend contract is:

- `CMS_URL` — Strapi REST base URL, ending in `/api`.
- `CMS_MEDIA_URL` — Strapi media host (no `/api`).
- `CMS_API_TOKEN` — optional; omit for unauthenticated reads (needs a public role).
- `CMS_WEBHOOKS_SECRET_HEADER` / `CMS_WEBHOOKS_SECRET_HEADER_VALUE` — shared webhook
  secret; must match the backend's `WEBHOOKS_SECRET_HEADER` / value.
- `SITE_URL` — canonical origin for `metadataBase`, `sitemap.xml`, `robots.txt`.
- `NEXT_PUBLIC_APP_VERSION` — inlined build version.

The frontend fails fast at startup if a required variable is missing.

## Running locally

Start the backend (`cd backend && npm run dev`) and the frontend
(`cd frontend && npm run dev`) on their default ports (1337 and 3000). On first boot
the backend creates a default admin user and provisions the revalidation webhook when
the relevant `ADMIN_*` and `WEBHOOKS_NEXTJS_TARGET` variables are set.

## Adding a content type

Extend the existing pipeline end-to-end rather than adding a parallel path: Strapi
schema (via the admin UI) → `frontend/cms/client.ts` → `mappers.ts` → `connector.ts` →
`data.ts` (cached read + cache tags) → webhook tag mapping (`cms/tags.ts`,
`cms/cache.ts`) → `sitemap.ts` → navigation entry → a page component and its route.
