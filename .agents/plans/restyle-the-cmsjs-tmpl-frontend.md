# Restyle the cmsjs-tmpl frontend

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Maintain this document in accordance with `.agents/docs/PLANS.md` from the repository root.

## Purpose / Big Picture

The reusable template currently renders semantic but almost unstyled content and placeholder layout chrome. After this work, every supported route will present the CMS content in a coherent dark technical style inspired by `style/DESIGN.md` and the four screenshots in `style/`, with visible branding and metadata set to exactly `cmsjs-tmpl`. A user can navigate Home, News, Events, and Articles from a sticky responsive header, recognize the active section, read collection and detail content on desktop or mobile, and see consistent loading, empty, not-found, and error states. The reference folder supplies visual direction only; unsupported search, authentication, registration, filtering, pagination, locations, authors, categories, and other invented data must not appear.

The implementation must preserve the existing server-side rendering plus incremental static regeneration model and the data path from the raw Strapi client through mapper, connector, cached data functions, and webhook revalidation. There are no Strapi schema, frontend DTO, CMS client, connector, cache, API, or route-contract changes.

## Progress

- [x] (2026-08-28 12:14Z) Inspected the authoritative instructions, dirty worktree, frontend routes and components, CMS DTOs and mappers, reference design assets, Tailwind 4 setup, validation tasks, and relevant local Next.js 16.3 documentation.
- [x] (2026-08-28 12:28Z) Repartitioned the frontend presentation components while preserving the current page-switch and collection-route contracts.
- [x] (2026-08-28 12:28Z) Applied the dark technical theme, supported-data page layouts, responsive navigation, and consistent state styling.
- [x] (2026-08-28 12:28Z) Updated metadata and repository guidance without losing pre-existing documentation edits.
- [x] (2026-08-28 12:34Z) Refreshed both OpenAPI commands, restored non-semantic schema-generator churn, and completed automated validation plus temporary-fixture HTTP checks; the unavailable in-app browser is recorded as a coverage limitation and is not a release gate.
- [x] (2026-08-28 13:31Z) Remediated review findings: collection cards now render only supported data, image loading and responsive sizing use current Next behavior, and duplicate inline-link keys are prevented. Re-ran canonical frontend validation.
- [x] (2026-08-28 13:55Z) Obtained independent approval after one remediation cycle; Reviewer reran tests, checks, build, generated-file diff, and whitespace validation and confirmed task scope, architecture, accessibility logic, and dirty-worktree isolation.

## Surprises & Discoveries

- Observation: The working tree already contains unrelated and overlapping edits. `AGENTS.md`, `README.md`, `frontend/app/(content)/loading.tsx`, and `frontend/components/page-switch.tsx` overlap this task; the latter two add a shared loading skeleton and make an unknown page type call `notFound()`. Other dirty CMS, backend, route-metadata, ignore-file, and debt-ledger changes are not part of this task.
  Evidence: `git status --short` lists the known modified/deleted files and untracked `frontend/components/loading-skeleton.tsx` plus `style/`; the inspected diffs show the exact overlaps.

- Observation: Next.js is 16.3.1 with Cache Components enabled and dynamic detail routes deliberately omitted from `generateStaticParams`. Local documentation states that pathname/segment client hooks can suspend on such routes and must be below `Suspense` or the build can fail.
  Evidence: `frontend/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md` and `use-selected-layout-segment.md` both describe this Cache Components behavior.

- Observation: `global-error.tsx` replaces the root layout and therefore does not inherit its theme class or font variables automatically.
  Evidence: `frontend/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md` requires global error UI to provide its own `html`, `body`, global styling dependencies, and `title`.

- Observation: Baseline unit tests pass, while the baseline frontend check fails only on formatting of user-owned changes.
  Evidence: `npm test` from `frontend/` reports 4 files and 13 tests passed. `mise run fe:check` reports only Biome formatting/import-order errors in `frontend/app/(content)/loading.tsx`, `frontend/app/refresh/route.ts`, and `frontend/cms/webhook.ts`, with no behavioral diagnostic.

- Observation: `mise run be:openapi` rewrites `frontend/cms/schema.json` despite no schema change: it reformats existing entries and changes Strapi's generated `publishedAt` default timestamp. The generated frontend declaration remains byte-for-byte unchanged.
  Evidence: the initial generation produced a 917-addition/274-deletion JSON diff, including only generator formatting and a current timestamp; restoring the initially clean JSON file returns `git diff --exit-code -- frontend/cms/schema.json frontend/cms/schema.d.ts` to zero.

- Observation: The configured in-app browser runtime reports `No browser is available`, so viewport and hydrated-client checks cannot run in this session.
  Evidence: browser runtime initialization against `http://127.0.0.1:65101/` returned that message before a tab could be created. A disposable loopback fixture still exercised representative, empty, missing, and HTTP-500 server responses through the Next development server; the production build passed.

- Observation: Next development logs `blocking-prerender`/`instant-shell-url-data` diagnostics for existing intentional `await io()` calls and dynamic route params while curl requests the Cache Components routes; the production build completes successfully with the expected partial-prerendered routes.
  Evidence: `mise run fe:build` reports `/`, `/articles`, `/events`, and `/news` as `◐ (Partial Prerender)` and dynamic detail routes as request-rendered; the diagnostics name existing route `io()`/`params` expressions and are absent from the production build.

- Observation: Next 16 deprecates the `priority` image prop in favor of current loading behavior. Collection category labels are not CMS-backed data and conflict with the supported-field boundary.
  Evidence: Reviewer remediation requested removal of `priority` and repeated `Article`, `Event`, and `News` card labels; `loading="eager"` remains for home hero media while all other images remain lazy by default.

## Decision Log

- Decision: Use only existing Tailwind 4, React, and Next.js capabilities. Define a small palette, radii, and font aliases in `frontend/app/globals.css`; do not add a design-system dependency, icon package, animation package, or custom theme framework.
  Rationale: Tailwind is already installed and the request is presentation-only. Native utilities are the smallest stable implementation.
  Date/Author: 2026-08-28 / Planner

- Decision: Load the variable `Geist` and `Geist_Mono` faces from `next/font/google` in the root layout and expose them as CSS variables. Do not add Hanken Grotesk or JetBrains Mono.
  Rationale: Local Next 16.3 documentation confirms `next/font/google` downloads fonts at build time and self-hosts them at runtime. Geist covers the requested readable sans and technical monospace roles without new repository assets or dependencies; the inspiration folder is not a design law.
  Date/Author: 2026-08-28 / Planner

- Decision: Keep page-owned cards inline in each collection `list-page.tsx` until another module reuses them. Create no standalone card module solely to mirror the screenshots.
  Rationale: Each card currently has one owner, and the DTOs differ. A separate component would add indirection without reuse. The required folder ownership is still explicit.
  Date/Author: 2026-08-28 / Planner

- Decision: Use `usePathname()` in the client navigation and mark a route active when the pathname equals its route or, except for `/`, begins with that route plus `/`. Wrap the navigation in a server-side `Suspense` boundary with a stable non-active navigation fallback.
  Rationale: This marks both collection and detail URLs correctly with one short rule. A one-level selected-segment hook at the root is complicated by the `(content)` route group, while the local Next 16.3 docs require Suspense for either approach on the unprerendered dynamic routes.
  Date/Author: 2026-08-28 / Planner

- Decision: Add no component-rendering test framework or visual snapshots. Rely on existing unit tests, type/lint/build validation, temporary-fixture HTTP checks, and independent static inspection of rendered markup and style logic.
  Rationale: The repository explicitly permits skipping frontend tests that would only assert visuals. Installing or constructing a DOM test seam would exceed the behavior it verifies.
  Date/Author: 2026-08-28 / Planner

- Decision: Treat the unavailable in-app browser as a recorded validation limitation rather than a release blocker, and require the Reviewer to inspect responsive classes, semantic and accessibility states, CMS-field boundaries, unsupported-feature exclusions, component partitioning, branding and documentation, SSR plus ISR preservation, dirty-worktree isolation, and validation logs.
  Rationale: `AGENTS.md` requires canonical validation and prohibits browser end-to-end tests; it does not establish live browser inspection as an authoritative release gate. The primary Coordinator authorized this minimum non-blocking substitute without changing product scope.
  Date/Author: 2026-08-28 / Coordinator

- Decision: Treat `style/` as read-only, untracked input and exclude it from every add/staging command.
  Rationale: The user explicitly requires it to remain unchanged and untracked.
  Date/Author: 2026-08-28 / Planner

- Decision: Enable Biome's built-in Tailwind 4 directive parser in `frontend/biome.json`.
  Rationale: The new CSS-first `@theme` declarations are the documented Tailwind 4 configuration mechanism, and the already-installed Biome 2.4 parser otherwise rejects them during the repository's canonical check.
  Date/Author: 2026-08-28 / Worker

- Decision: Keep collection card markup inline in its three page-owned list components and add one shared empty state.
  Rationale: The card markup has one owner per DTO shape; only the empty presentation has multiple concrete owners.
  Date/Author: 2026-08-28 / Worker

- Decision: Cap responsive image `sizes` at the actual hero-grid column (581px) and article content width (704px); use index-keyed React fragments for inline links because the CMS model supplies no inline node IDs and sibling URLs may repeat.
  Rationale: The caps match the padded `max-w-6xl`/`max-w-3xl` containers, while fragments make repeated link URLs unambiguously unique without adding CMS data or changing rendering output.
  Date/Author: 2026-08-28 / Worker

## Outcomes & Retrospective

The presentation implementation is complete and independently approved: page-owned, layout, and shared components now use the requested dark technical visual language, render only current DTO fields, and preserve the CMS route/data architecture. Remediation removed unsupported collection labels, deprecated image priority plumbing, overbroad size hints, and duplicate link keys. `npm test` passed 4 files / 13 tests; `mise run fe:check` and `mise run fe:build` passed after remediation; generated frontend API declarations have no diff. A disposable loopback fixture verified representative CMS content, all three empty collection states, not-found content, and the HTTP-500 server response without CMS mutation. The in-app browser was unavailable, so no desktop/mobile visual, reduced-motion, focus, hydrated retry, or global-error interaction claim is made; the Reviewer instead approved the responsive classes, semantics and accessibility states, supported-field boundary, component ownership, SSR plus ISR preservation, validation evidence, and worktree isolation by static inspection. Commit and push remain Coordinator-owned.

## Context and Orientation

The active branch is `main`, tracking `origin/main`, and must not change. The frontend is a Next.js 16.3 App Router application under `frontend/`. `frontend/app/layout.tsx` composes the site header, route child, and footer. CMS-backed route files under `frontend/app/(content)/` call cached functions in `frontend/cms/data.ts`; detail and home routes delegate to `frontend/components/page-switch.tsx`, while the three collection routes render list components directly. Preserve that intentional split.

The supported frontend data is defined in `frontend/cms/model.ts`. Home has a title and repeated heroes containing headline, optional subheading, optional CTA text, and an image. An article has identity plus repeated sections containing an optional header, optional image, and rich blocks. An event has identity, summary, optional date, and rich blocks. News has identity, summary, and rich blocks. Collection items expose only article identity; event identity, summary, and optional date; or news identity and summary. Rich blocks can be paragraphs, headings, lists, quotes, code with an optional language, and images with accessible alternative text and an optional editorial caption. Image names, MIME values, dimensions, and generated formats are rendering metadata, not extra editorial labels.

The final component ownership is:

- `frontend/components/page-switch.tsx` remains at the root because it dispatches across all document page types.
- `frontend/components/home/page.tsx`, `articles/page.tsx`, `events/page.tsx`, and `news/page.tsx` own the four concrete detail/home page renderers.
- `frontend/components/articles/list-page.tsx`, `events/list-page.tsx`, and `news/list-page.tsx` own collection layouts and their private card markup.
- `frontend/components/layout/site-header.tsx`, `site-nav.tsx`, and `site-footer.tsx` own site chrome.
- `frontend/components/shared/content.tsx`, `loading-skeleton.tsx`, and `empty-state.tsx` own presentation reused across page families.

Do not create additional card, button, typography, icon, or layout abstractions unless implementation proves a second concrete owner. Existing component exports and props remain the same after moving: `HomePage({ page })`, `ArticlePage({ page })`, `EventPage({ page })`, `NewsPage({ page })`, the three `*ListPage({ items })` exports, and `PageSwitch({ page })`.

The design input is `style/DESIGN.md` plus `style/screena.png`, `screene.png`, `screenh.png`, and `screenn.png`. Translate only the general visual vocabulary: deep slate/obsidian background, layered slate surfaces, purple accent, light text, low-contrast one-pixel borders, compact four-pixel-like radii, sans headlines/body, monospace metadata, generous page spacing, responsive grids, and no shadows. Do not copy screenshot content or controls that the DTOs do not support.

## Plan of Work

First, move the current root-level presentation files into the ownership structure above and update all imports in `frontend/app/layout.tsx`, the three collection route pages, `frontend/app/(content)/loading.tsx`, and `frontend/components/page-switch.tsx`. Preserve the existing `notFound()` default in the dirty page switch. Preserve the dirty loading route's delegation to a reusable skeleton, but move that untracked skeleton to `shared/` and improve it rather than creating a second loader. Delete the old root-level component paths only after every importer points to the new paths. Do not touch route data access, metadata generation on detail routes, CMS modules, or caching calls.

Next, make `frontend/app/globals.css` the minimal Tailwind 4 theme source. Retain `@import "tailwindcss"`; add `@theme` values for the reference palette and compact card radius, and `@theme inline` aliases from the Next font variables to Tailwind's sans and mono families. Give those aliases native fallbacks with `var(--font-geist, ui-sans-serif)` and `var(--font-geist-mono, ui-monospace)` so the standalone global-error document remains legible without root-layout font variables. Add only global element rules that are truly global: dark color scheme, background/text defaults, visible keyboard focus, page-height/layout behavior, and scroll padding for the sticky header. Use utilities in components for local layout. Do not define shadows, gradients, JS animation, or a broad component class system.

In `frontend/app/layout.tsx`, instantiate `Geist` and `Geist_Mono` with Latin subsets, `display: "swap"`, and CSS variables; apply both variables to `html`. Keep `metadataBase`, and retain exactly one semantic `main` landmark by continuing to let page components own `main`. The document body must arrange header, page, and footer into a full-height page without changing route rendering.

Implement the header under `components/layout/` as a sticky, bordered, translucent slate bar. The brand link text is exactly `cmsjs-tmpl`. The navigation contains only Home (`/`), News (`/news`), Events (`/events`), and Articles (`/articles`) in that order. Keep the layout usable without a hamburger state machine: wrap into a compact second row on narrow screens and align in one row on larger screens. `site-nav.tsx` is the smallest client component; it owns the fixed route list, a private link-rendering helper, the pathname active rule, `aria-current="page"`, purple active indicator, and visible focus styling. Export `SiteNav` for the hook-aware version and `SiteNavFallback` for the same private renderer without an active pathname. `site-header.tsx` remains a server component and renders `<Suspense fallback={<SiteNavFallback />}><SiteNav /></Suspense>` so dynamic detail routes can prerender safely without duplicating navigation data. The footer repeats only the exact brand and supported navigation; add no legal, contact, social, sign-in, subscription, or documentation claims.

Restyle the supported pages without inventing fields. Home renders its title and each hero's headline, optional subheading, responsive CMS image, and optional CTA as a visibly non-interactive monospace callout: use plain text with no anchor, button role, hover treatment, or pointer cursor. The three collection pages render a heading, responsive one-to-three-column bordered-card grid, and `EmptyState` when their arrays are empty. Article cards show title only. Event cards show title, summary, and optional native `time` element using the unchanged CMS date string. News cards show title and summary. Each complete card may be a link to its existing detail route, but there are no additional controls.

Article, event, and news detail pages use a narrow readable article column. Preserve all existing supported fields and rich blocks. In shared content rendering, retain semantic heading levels, ordered/unordered lists, quotes, inline marks, and links. Present optional code language as a small monospace label and optional image caption as `figcaption`; use DTO image URL, width, height, and alternative text with Next `Image`. Add `className="h-auto w-full"` and an accurate `sizes` hint for the content container so remote CMS images remain responsive without losing intrinsic aspect ratio. Keep eager loading only for home hero images and native lazy loading otherwise.

Style `shared/loading-skeleton.tsx`, `shared/empty-state.tsx`, `frontend/app/(content)/not-found.tsx`, `frontend/app/(content)/error.tsx`, and `frontend/app/global-error.tsx` from the same palette. The skeleton keeps `aria-busy` and a polite visually hidden loading message, and its pulse animation must include `motion-reduce:animate-none`. Error components remain client components with the stable Next 16.3 `retry` callback. The global error keeps its own `html`, `body`, and React `title`, and imports `@cmsjs/app/globals.css` itself after the client directive because the root layout is replaced. All links and retry buttons need keyboard-visible focus. Do not expose raw error details.

Change `frontend/app/meta.ts` so both the default title and title template use exactly `cmsjs-tmpl`. Search the tracked documentation and frontend presentation for `DevConnect`, `CMS Template`, `styleless`, `unstyled`, and `placeholder` claims and remove relevant occurrences. In `AGENTS.md`, replace the styleless/placeholder architecture language with the rule that bundled styles and components are demonstrative examples, not design laws and not reusable presentation assets as-is; preserve SSR plus ISR as the actual contract. Document page-folder ownership, `layout/` and `shared/` cross-page exceptions, root `page-switch.tsx`, and the direct-render collection exception. Update the equivalent README section concisely. Preserve unrelated formatter-only changes already present in both files.

Finally, run the required generated-artifact refresh and validation. Since no schema changed, both generated files must be byte-for-byte unchanged after regeneration. Mechanically accept Biome formatting/import-order changes needed in the pre-existing dirty `frontend/app/refresh/route.ts` and `frontend/cms/webhook.ts`, but make no behavioral edit to them and do not treat those files as task-owned for staging. Exercise representative and failure responses with a temporary CMS data source on loopback ports 65100-65199, then remove the fixture. Because no in-app browser is available, require the independent Reviewer to inspect the responsive, semantic, accessibility, supported-data, architecture, and isolation properties directly in the implementation and validation logs. Leave `style/` untouched and untracked.

## Milestones

### Milestone 1: Component ownership and framework-safe layout

At the end of this milestone, every presentation component is under its page, layout, or shared owner, all route imports resolve, page-switch dispatch remains exhaustive through the preserved `notFound()` fallback, and the root layout loads fonts and site chrome without altering CMS fetches. Run `mise run fe:typecheck` from the repository root and expect it to finish without TypeScript errors. This milestone is complete only when no old root-level presentation import remains except `@cmsjs/components/page-switch`.

### Milestone 2: Supported-content visual system

At the end of this milestone, Home, Articles, Events, News, rich content, images, navigation, footer, loading, empty, missing-content, content-error, and global-error states share the dark technical theme. Responsive layouts work without horizontal overflow, no element implies an unsupported capability, focus indicators are visible, and reduced-motion users do not receive skeleton animation. Run `mise run fe:check`; after only the authorized mechanical formatting fixes, expect a successful exit.

### Milestone 3: Guidance, generated surface, and observable validation

At the end of this milestone, visible metadata and brand are `cmsjs-tmpl`, documentation describes demonstrative presentation and folder ownership accurately, generated OpenAPI outputs are refreshed with no diff, and automated validation plus temporary-fixture HTTP checks pass. The in-app browser limitation is recorded without claiming visual coverage. Independent review must statically verify the responsive classes, semantic and accessibility states, CMS-field boundary, unsupported-feature exclusions, component partition, branding and documentation, SSR plus ISR preservation, dirty-worktree isolation, and validation logs before the Coordinator stages task-owned hunks, commits once as `Restyle the cmsjs-tmpl frontend`, and pushes to `origin/main`.

## Concrete Steps

Work from `/Users/federico.paolillo/src/cmsjs-tmpl` and stay on `main`. Before editing, record the current dirty state so later comparisons preserve it:

    git branch --show-current
    git status --short
    git diff -- AGENTS.md README.md 'frontend/app/(content)/loading.tsx' frontend/components/page-switch.tsx

Implement Milestones 1 and 2 with file moves and focused edits. Do not format the entire repository. At a stopping point, update this plan's `Progress`, `Surprises & Discoveries`, and `Decision Log` with a UTC timestamp.

Run the generated artifact refresh from the repository root:

    mise run be:openapi
    mise run fe:openapi
    git diff --exit-code -- frontend/cms/schema.json frontend/cms/schema.d.ts

The final command must print no diff and exit zero. Do not run `be:types`; no backend type changed. If either generated file differs, stop and determine why instead of accepting an API change into this presentation task.

Run the canonical automated validation:

    cd /Users/federico.paolillo/src/cmsjs-tmpl/frontend
    npm test
    cd /Users/federico.paolillo/src/cmsjs-tmpl
    mise run fe:check
    mise run fe:build

Expected results are four Vitest files and 13 current tests passing, Biome and TypeScript completing without errors, and a successful production Next build that does not fetch CMS content at build time. The exact test count may increase only if a focused non-visual regression test becomes necessary; do not add visual snapshots.

For request-time validation, use ports `127.0.0.1:65100` for the temporary CMS fixture and `127.0.0.1:65101` for Next. Prefer the existing local CMS only if it already supplies representative published data without mutation. Otherwise create an ignored temporary fixture under `backend/.tmp/` using Node's standard `http` module; it must serve the four existing `/api/home-page`, `/api/articles`, `/api/events`, and `/api/news` contracts plus a small image, using raw objects that the current mappers accept. Give it representative content, empty collection arrays, and HTTP 500 modes. Do not add a fixture package or tracked file. Start Next with temporary environment overrides equivalent to:

    CMS_URL=http://127.0.0.1:65100/api \
      CMS_MEDIA_URL=http://127.0.0.1:65100 \
      CMS_API_TOKEN= \
      SITE_URL=http://127.0.0.1:65101 \
      CMS_WEBHOOKS_SECRET_HEADER=fixture \
      CMS_WEBHOOKS_SECRET_HEADER_VALUE=fixture \
      npm --prefix frontend run dev -- --hostname 127.0.0.1 --port 65101

The representative fixture must include multiple collection items, both present and absent optional event dates, each rich-block kind, an image with alternative text and caption, and a code block with language. Restart the Next development process between fixture modes so its in-process cache cannot hide changed responses. Use HTTP requests to verify representative routes, all three empty collection states, a missing slug, and an HTTP 500 response. Stop both processes and delete only the exact temporary fixture file; do not alter the source screenshots or the user's database. Record that the configured in-app browser was unavailable and do not claim live desktop/mobile, focus, reduced-motion, retry, or global-error interaction coverage. The independent Reviewer must instead inspect the responsible markup, classes, component boundaries, and validation evidence directly.

Run final claim and isolation checks:

    rg -n -i 'DevConnect|CMS Template|styleless|unstyled|placeholder' AGENTS.md README.md frontend/app frontend/components
    git status --short
    git diff --check
    git diff --stat

The first command should find no relevant branding or presentation claim. `style/` must still appear only as untracked input and must never enter the index. The final status must retain every pre-existing unrelated user change unless a required formatting-only correction was applied.

## Validation and Acceptance

Acceptance requires all of the following observable behavior:

- The document title defaults to `cmsjs-tmpl` and detail/list titles use the `... | cmsjs-tmpl` template. No tracked UI or guidance says DevConnect, CMS Template, styleless, unstyled, or placeholder.
- Header and footer display exactly `cmsjs-tmpl` and only link to `/`, `/news`, `/events`, and `/articles`. The active top-level link exposes `aria-current="page"` on both collection and detail URLs. Header navigation remains usable at mobile width without a menu script.
- Home renders every DTO-supported hero field. CTA text is plain non-interactive text and cannot be focused or activated.
- Article lists show only article titles. Event lists show only title, summary, and optional date. News lists show only title and summary. No screenshot-only search, sign-in, register, filter, category, author, location, popularity, newsletter, load-more, legal, or contact control appears.
- Detail routes retain their current fields and semantic rich content. CMS images keep valid alternative text, intrinsic aspect ratio, responsive width, and an appropriate `sizes` hint; optional editorial captions and code-language labels render when present.
- Empty collections, loading, missing content, content errors, and global errors use the same palette and readable layout. Retry buttons still invoke Next's `retry`. Loading is announced to assistive technology and does not animate under reduced-motion preference.
- The page uses dark slate tonal layers, purple accents, one-pixel borders, compact radii, monospace metadata, responsive grids, and no shadows. Desktop and mobile have no horizontal overflow and all interactive elements have a visible keyboard focus indicator.
- SSR plus ISR remains intact: no `generateStaticParams`, static export, route change, CMS pipeline change, or build-time CMS dependency is introduced. `mise run fe:build` succeeds with the backend unavailable.
- `npm test`, `mise run fe:check`, and `mise run fe:build` all exit zero. Both OpenAPI regeneration commands run and leave `frontend/cms/schema.json` and `frontend/cms/schema.d.ts` unchanged.

## Idempotence and Recovery

All generation and validation commands are safe to rerun. If a component move is interrupted, inspect both old and new paths with `rg --files frontend/components` and finish imports before deleting the superseded file; never use `git reset --hard` or `git checkout --` because the tree contains user work. If the generated API files change unexpectedly, keep the diff for diagnosis and stop rather than staging it. If request-time validation needs different data, restart only the ignored temporary fixture; never edit Strapi schemas or the user's `backend/cmsjs-tmpl.db`.

Before handoff, compare `git status --short` against the recorded baseline. Preserve user behavior in overlapping files. `AGENTS.md` and `README.md` must retain unrelated pre-existing formatting. The loading move must retain the user's skeleton delegation, and page-switch must retain its `notFound()` default. Mechanical formatting of `frontend/app/refresh/route.ts` and `frontend/cms/webhook.ts` is allowed solely to make canonical validation pass, but their functional changes remain user-owned and must not be staged with this task.

The Worker must not stage, commit, or push. After independent approval, the Coordinator must stage task-owned paths and use patch mode for overlapping documents. Explicitly exclude `style/`, `DEBT.md`, `backend/src/index.ts`, `frontend/.gitignore`, dirty CMS/cache/webhook changes, and unrelated detail-route metadata changes. Review `git diff --cached --name-status` and `git diff --cached` before creating exactly one commit titled `Restyle the cmsjs-tmpl frontend`; push that commit on `main` to `origin/main`.

## Artifacts and Notes

Planning baseline:

    branch: main
    upstream: origin/main
    frontend: Next 16.3.1, React 19.2.8, Tailwind CSS 4, Biome 2.4.2, Vitest 3.2.7
    tests: 4 files passed, 13 tests passed
    fe:check: fails on 4 formatting/import-order diagnostics only

The most important local framework facts are embedded above. Their source files are `frontend/node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`, `13-fonts.md`, `03-api-reference/02-components/font.md`, `03-api-reference/03-file-conventions/loading.md`, `error.md`, and `03-api-reference/04-functions/use-pathname.md`.

## Interfaces and Dependencies

There is no public data or route interface change. Keep `CmsPageDto` and every DTO in `frontend/cms/model.ts` unchanged. Keep `PageSwitch({ page }: { page: CmsPageDto })` and the existing page/list component prop shapes unchanged. Internal module import paths change to the folder layout in `Context and Orientation`. Navigation introduces only a private route-list constant and private active-path rule in `components/layout/site-nav.tsx`; it does not create a public API.

Use only installed `next`, `react`, and Tailwind CSS. `next/font/google` supplies `Geist` and `Geist_Mono`; `next/link`, `next/image`, `next/navigation`, and React `Suspense` supply navigation, image optimization, pathname state, and the required Cache Components boundary. Add no dependencies and do not change `frontend/package.json`, `frontend/next.config.ts`, CMS modules, backend files, or the Strapi schema.

Revision note: 2026-08-28 / Planner — Created the initial self-contained ExecPlan after repository, reference-asset, dirty-tree, validation-baseline, Context7, and local Next.js 16.3 inspection. The plan resolves component ownership, active navigation under Cache Components, global error styling, supported DTO rendering, validation, temporary visual fixtures, and task-hunk isolation.

Revision note: 2026-08-28 / Worker — Recorded completed presentation work, the necessary Tailwind 4 Biome parser setting, automated validation, non-semantic OpenAPI generator churn restoration, temporary fixture evidence, and the unavailable in-app-browser prerequisite.

Revision note: 2026-08-28 / Coordinator — Confirmed through the configured browser runtime and its troubleshooting flow that no in-app browser backend is available and initially stopped before review, commit, or push.

Revision note: 2026-08-28 / Coordinator — Resumed after the primary Coordinator clarified that live browser inspection is not an authoritative release gate, replaced it with explicit independent static inspection plus the completed canonical and request-time evidence, and retained the unavailable-browser limitation without claiming visual coverage.

Revision note: 2026-08-28 / Worker — Remediated the first review findings and recorded the collection-field, Next image, responsive-size, and unique-key decisions with passing post-remediation validation.

Revision note: 2026-08-28 / Coordinator — Recorded Reviewer approval after remediation cycle 1, closed the review progress item, and finalized outcomes with the exact automated, request-time, static-review, and unavailable-browser evidence.
