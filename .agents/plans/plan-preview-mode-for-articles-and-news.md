# Add Strapi Preview for articles and news

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Maintain this document in accordance with `.agents/docs/PLANS.md` from the repository root.

## Purpose / Big Picture

After the future implementation is complete, an authenticated Strapi editor can open an Article or News entry in the Content Manager, choose Preview, and see that entry at its real Next.js detail URL. A draft preview shows the latest unpublished values immediately; a published preview shows the live version. Draft Mode is scoped to the editor's browser by Next.js' `__prerender_bypass` cookie, so ordinary visitors continue to receive the existing server-rendered and incrementally revalidated published pages.

This plan deliberately separates documentation from implementation. The current workflow may create this ExecPlan and update `README.md` and `AGENTS.md`; it must not implement Preview. `README.md` must accurately say that Preview is planned, not currently available, and point to this plan. `AGENTS.md` must tell future agents to include Preview proactively only for content types they strongly judge to benefit from an editor seeing unpublished presentation. Preview production code begins only in a later, separately authorized implementation workflow. When that later workflow finishes and validation passes, replace the README's planned-status wording with the final availability and environment contract described below.

No content-type schema change is required. Article and News already have Strapi Draft & Publish enabled. If future implementation discovers that a Strapi content-type definition must change, stop and obtain explicit user confirmation before changing it through Strapi's API or admin UI; do not edit a schema JSON file directly.

## Progress

- [x] (2026-08-30 20:17Z) Read the task, repository instructions, `.agents/docs/PLANS.md`, Ponytail and Context7 skills, current Strapi and Next.js documentation, installed Next.js 16.3.1 guides, installed Strapi 5.52 types/source, relevant repository code, generated API types, validation commands, and dirty worktree.
- [x] (2026-08-30 20:17Z) Established the documentation-only boundary for the current workflow and designed the minimal future implementation end to end.
- [x] (2026-08-30 20:25Z) Updated `README.md` to state that Article and News Preview is planned in this ExecPlan and not implemented; no setup contract was added.
- [x] (2026-08-30 20:25Z) Updated `AGENTS.md` with the selective proactive Preview rule, shared-path requirement, and reference to the existing explicit confirmation gate; performed no Preview implementation.
- [x] (2026-08-30 20:26Z) Ran the documentation searches and `git diff --check`; both passed. `git status --short --branch` showed only `README.md`, `AGENTS.md`, this ExecPlan, and the pre-existing untracked `style/`; backend/frontend and `style/` had no tracked diff.
- [x] (2026-08-30 20:35Z) Remediated the bounded plan review findings: removed the unresolved Vitest `server-only` marker from the proposed helper, corrected test-baseline/coverage statements, and ordered API-token provisioning before Next startup.
- [x] (2026-08-30 20:35Z) Re-ran the plan/documentation searches, `git diff --check`, ExecPlan whitespace check, and scope checks; all passed with no backend/frontend or `style/` tracked diff.
- [x] (2026-08-30 20:37Z) Independent review approved the plan and documentation after one remediation cycle. The reviewer confirmed the three findings were corrected, focused tests passed 2 files and 8 tests, frontend lint/type generation/TypeScript passed, no implementation files changed, and `style/` remained untouched.
- [ ] In a separately authorized future workflow, configure Strapi Preview for Article and News without changing either content type.
- [ ] In that future workflow, add the secure Next.js Draft Mode entry/exit route and status-aware Article and News reads through the existing CMS pipeline.
- [ ] In that future workflow, add the draft indicator, focused trust-boundary/query tests, environment examples, and final README availability contract.
- [ ] Refresh generated API artifacts, run canonical backend/frontend validation, verify Strapi starts from an empty database, and manually demonstrate draft isolation and exit behavior.
- [ ] In that future workflow, obtain independent review, record results in the living sections, then leave commit and push to the workflow role that has that authority.

## Surprises & Discoveries

- Observation: The worktree is on `main`, tracks `origin/main`, and has only the unrelated untracked `style/` directory.
  Evidence: `git status --short --branch` prints `## main...origin/main` and `?? style/`. The plan and every later workflow must leave `style/` untouched and untracked.

- Observation: Article and News already satisfy the only schema prerequisite for Preview.
  Evidence: `backend/src/api/article/content-types/article/schema.json` and `backend/src/api/news-item/content-types/news-item/schema.json` both contain `"draftAndPublish": true`; their UIDs are `api::article.article` and `api::news-item.news-item`.

- Observation: The installed Strapi 5.52 type is stricter than the scalar `allowedOrigins` shown by the current Context7 documentation excerpt.
  Evidence: `backend/node_modules/@strapi/types/dist/core/config/admin.d.ts` declares `PreviewConfig.allowedOrigins?: string[]`. The implementation must pass an array such as `[previewClientUrl.origin]`, not a string.

- Observation: Strapi's internal Preview request validation supplies `documentId`, optional `locale`, and a status that defaults to `draft` when Draft & Publish is enabled, but the public `Core.Config.Admin` handler type weakens `status` to an optional string.
  Evidence: `backend/node_modules/@strapi/content-manager/dist/server/preview/controllers/validation/preview.js.map` and `services/preview-config.js.map` show the runtime contract; `backend/node_modules/@strapi/types/dist/core/config/admin.d.ts` shows the broader public type. The handler must guard `documentId` and the two accepted status values.

- Observation: Next.js 16.3.1 Draft Mode natively provides the required cache isolation.
  Evidence: `frontend/node_modules/next/dist/docs/01-app/02-guides/draft-mode.md`, `03-api-reference/04-functions/draft-mode.md`, and `03-api-reference/01-directives/use-cache.md` state that `await draftMode()` is required, `enable()` sets `__prerender_bypass`, and an enabled request bypasses fetch cache, ISR response cache, `unstable_cache`, and all `"use cache"` reads/writes. Other visitors remain on normal cached responses.

- Observation: The raw CMS client currently hard-codes `status: "published"` for detail queries, so Draft Mode alone would still render published Strapi data.
  Evidence: `frontend/cms/client.ts` builds Article, Event, and News detail queries through `contentQuery()`, which currently fixes the status to `published`. The future change must carry an explicit status through data, connector, and client for Article and News only.

- Observation: The existing secret comparator is generic logic under a webhook-specific name, but it has no direct test coverage.
  Evidence: `frontend/cms/webhook.ts` exports `timingSafeCompareWebhookSecret()` using Node's `timingSafeEqual`; `frontend/cms/webhook.test.ts` has four `parseWebhookPayload()` tests only. Preview creates a second genuine owner, so the algorithm should move once to a small neutral module and receive direct coverage there.

- Observation: The application uses `import "server-only"` in `frontend/config.ts` and `frontend/deps.ts`, but Vitest resolves only the `@cmsjs` alias.
  Evidence: `frontend/vitest.config.ts` defines no `server-only` alias. Keep the future pure helper testable without prescribing that unresolved import.

- Observation: The focused existing client/webhook test subset is smaller than the full frontend baseline.
  Evidence: `npm --prefix frontend test -- cms/client.test.ts cms/webhook.test.ts` reports 2 files and 8 tests passed; the full baseline remains 4 files and 14 tests passed.

- Observation: The planning baseline is green.
  Evidence: From `frontend/`, `npm test` reports 4 files and 14 tests passed, and `npm run check` completes Biome, Next route type generation, and TypeScript without errors.

## Decision Log

- Decision: The current workflow stops after the plan plus accurate README and AGENTS guidance; all Preview code is future work.
  Rationale: The direct request is to plan the feature, and the Coordinator explicitly forbids implementation in this workflow. Claiming availability before code and validation exist would be false.
  Date/Author: 2026-08-30 / Planner

- Decision: Configure Preview only for `api::article.article` and `api::news-item.news-item`, using their existing nested `identity.slug` to produce `/articles/<slug>` and `/news/<slug>`.
  Rationale: These are the requested content types and existing detail routes. Events, the home page, collection pages, localization, and generic content-type registration are not requested.
  Date/Author: 2026-08-30 / Planner

- Decision: Use Strapi's built-in Preview handler and Next.js 16.3.1's built-in Draft Mode. Add no dependency and no custom Strapi endpoint.
  Rationale: These are the standard platform capabilities and preserve the existing stack and architecture.
  Date/Author: 2026-08-30 / Planner

- Decision: Use one backend `PREVIEW_CLIENT_URL`, a matching non-public `PREVIEW_SECRET` in both projects, and the existing server-only `CMS_API_TOKEN` for Strapi reads.
  Rationale: Strapi needs the frontend origin and a shared secret to construct the entry URL. Next needs only the matching secret. The existing raw client already supports a bearer token; a new credential path would duplicate it. `PREVIEW_SECRET` must never use a `NEXT_PUBLIC_` prefix.
  Date/Author: 2026-08-30 / Planner

- Decision: Require `CMS_API_TOKEN` to be a least-privilege Strapi API token that can find Article and News content when Preview is enabled.
  Rationale: Draft content must be fetched server-side without broadening anonymous/public permissions. The token remains server-only and uses the client path already present.
  Date/Author: 2026-08-30 / Planner

- Decision: Map only a validated, encoded single slug segment to the two known local detail-route prefixes, and reject every other preview target before toggling Draft Mode.
  Rationale: This prevents an open redirect without an extra CMS existence request. The URL is generated by the authenticated Strapi admin handler; a missing document can safely resolve through the existing detail route's `notFound()` behavior.
  Date/Author: 2026-08-30 / Planner

- Decision: Interpret Strapi status `draft` as enabling Draft Mode and status `published` as disabling it before redirecting.
  Rationale: Strapi exposes both preview states. Explicitly disabling on published preview prevents a previous draft cookie from leaking into a later published comparison.
  Date/Author: 2026-08-30 / Planner

- Decision: Change only Article and News single-document reads to select `draft` or `published` through `await draftMode()` inside their existing `"use cache"` functions. Keep list reads and Event/Home reads published.
  Rationale: Next 16.3.1 explicitly permits `isEnabled` inside a caching directive and automatically prevents draft results from being stored. This preserves the existing client → connector → cached data path and avoids a parallel preview pipeline.
  Date/Author: 2026-08-30 / Planner

- Decision: Show a small accessible draft indicator with a native POST form on Article and News detail routes; handle entry GET and exit POST in one `frontend/app/preview/route.ts`.
  Rationale: Editors need to know they are viewing unpublished content and need a deterministic exit. POST is the correct mutation method for exit, while GET is required for the Strapi admin-generated preview URL. One route file is enough.
  Date/Author: 2026-08-30 / Planner

- Decision: Do not change the Article or News schema, page DTOs, mappers, page-switch dispatch, webhook tags, collection routes, sitemap, robots, or navigation.
  Rationale: Preview changes publication selection, not the content shape or discovery surface. Existing webhook revalidation remains the owner of published-cache invalidation; draft requests bypass cache without revalidation.
  Date/Author: 2026-08-30 / Planner

- Decision: Test pure request validation and raw query serialization at their owning boundaries, then rely on framework build validation and a manual editor scenario for cookie/iframe behavior.
  Rationale: Security and query status are application logic and require negative coverage. Re-testing Next's cookie implementation or adding browser automation would duplicate framework behavior and violate the repository's test constraints.
  Date/Author: 2026-08-30 / Planner

- Decision: Keep the proposed `frontend/cms/secret.ts` free of `import "server-only"`, and import it only from server-owned CMS and route modules that receive secrets from non-public configuration.
  Rationale: Next.js supports the marker, but this repository's current Vitest configuration cannot resolve it. Node `crypto`, module ownership, and non-public configuration retain the required boundary without adding an alias or dependency.
  Date/Author: 2026-08-30 / Implementer

- Decision: Provision the task-local Strapi API token before starting Next.js during manual acceptance.
  Rationale: `frontend/config.ts` requires `CMS_API_TOKEN` when the frontend initializes, so starting Next first is impossible on a fresh database.
  Date/Author: 2026-08-30 / Implementer

## Outcomes & Retrospective

Planning and the documentation-only implementation are complete and independently approved after one remediation cycle. `README.md` accurately marks Article and News Preview as planned but not implemented, and `AGENTS.md` now directs future agents to add Preview selectively through the shared pipeline while preserving the content-type confirmation gate. No Preview implementation or content-type mutation occurred, so the repository retains its original published-only behavior. A later implementation workflow must record the editor-visible result, exact validation evidence, generated-artifact outcome, manual acceptance observations, review result, and any deviation from the interfaces below.

## Context and Orientation

The repository is a Strapi 5.52 backend plus a Next.js 16.3.1 App Router frontend. The frontend's contract is server-side rendering plus incremental static regeneration, abbreviated SSR + ISR: content is rendered on a request and the result is reused until its time or cache tag requires refresh. `frontend/next.config.ts` enables Cache Components. A function containing `"use cache"` participates in that framework cache.

Published content follows one pipeline. `frontend/cms/client.ts` performs raw Strapi REST requests with `openapi-fetch` and bracket-style query serialization. `frontend/cms/connector.ts` maps raw results through `frontend/cms/mappers.ts` into the DTOs in `frontend/cms/model.ts`. `frontend/cms/data.ts` wraps connector reads in `"use cache"`, `cacheLife("days")`, and content-specific `cacheTag()` calls. Detail routes under `frontend/app/(content)/articles/[slug]/page.tsx` and `frontend/app/(content)/news/[slug]/page.tsx` call those data functions and delegate presentation to `frontend/components/page-switch.tsx`. Do not replace or bypass this pipeline.

Published-cache invalidation is separate. Strapi's webhook reaches `frontend/app/refresh/route.ts`; `frontend/cms/tags.ts` maps Article and News events to their collection and slug tags. Preview must not alter this path. Draft Mode makes only the editor's requests uncached; publishing still causes the existing webhook to refresh visitor-facing cached content.

Strapi Preview is the editor-facing feature in the Content Manager. Its configuration belongs in `backend/config/admin.ts`. For a requested content entry, Strapi invokes the configured handler with the content-type UID, document ID, optional locale, and requested `draft` or `published` status. The handler returns the Next.js entry URL. It returns `null` for unsupported UIDs or invalid documents, which removes Preview for those cases.

Next.js Draft Mode is a per-browser cache bypass. The entry route calls `await draftMode()` from `next/headers`, enables or disables its cookie, and redirects to a normal detail URL. Article and News cached data functions inspect `isEnabled`: draft requests query Strapi with `status=draft`; all other requests query `status=published`. Strapi 5 does not fall back between draft and published versions, so the selected status must be explicit.

The current relevant configuration is in `backend/.env.example`, `frontend/.env.example`, and server-only `frontend/config.ts`. `frontend/deps.ts` constructs one client and connector from that configuration. Keep this composition root unchanged except that its existing connector receives the expanded method signatures automatically.

The immediate documentation files are `README.md` and root `AGENTS.md`. The only unrelated worktree input is `style/`; never edit, stage, remove, or use it for this feature.

## Plan of Work

First, finish only the current documentation workflow. In `README.md`, add a concise `Preview status` section near `Rendering model`. State that Article and News Preview is specified by `.agents/plans/plan-preview-mode-for-articles-and-news.md`, is not implemented in the current template yet, and therefore has no working setup contract yet. In root `AGENTS.md`, add an architecture rule near the content-type pipeline rules: future agents should proactively implement the existing Strapi Preview plus Next Draft Mode path for an existing or new Draft & Publish content type when they strongly judge that seeing unpublished presentation materially helps editors. The rule must say not to add Preview mechanically to every content type, to extend one shared preview mapping/status path instead of inventing a parallel pipeline, and to retain the explicit user-confirmation gate before any content-type change. Do not touch implementation files. Run the documentation checks under `Concrete Steps`, update this plan's living sections, and stop the current workflow.

In a separately authorized future workflow, begin with backend configuration. In `backend/.env.example`, document required `PREVIEW_CLIENT_URL` and `PREVIEW_SECRET`. The client URL is the absolute Next.js origin; the secret is a high-entropy shared token and must match the frontend value. In `backend/config/admin.ts`, preserve all current auth, token, encryption, and flag configuration. Parse the client URL with the standard `URL` class, require the secret, and add `preview: { enabled: true, config: { allowedOrigins: [previewClientUrl.origin], handler } }`. Keep the handler in this file because it is used only by this configuration.

The Strapi handler must accept only `api::article.article` and `api::news-item.news-item`. Guard a missing `documentId` and any status other than `draft` or `published`. Use `strapi.documents(uid).findOne({ documentId, status, populate: { identity: true } })` so a changed draft slug produces the draft URL and a published comparison uses the published slug. Current content types are not localized, so do not add locale handling or i18n configuration. Validate structurally that the returned document has a non-empty string `identity.slug`; otherwise return `null`. Encode the slug with `encodeURIComponent`, choose `/articles/` or `/news/`, create a URL relative to `PREVIEW_CLIENT_URL`, and set exactly `url`, `secret`, and `status` query parameters with `URLSearchParams`. Do not log the returned URL because it contains the secret.

Next, extend frontend configuration. In `frontend/.env.example`, add the matching server-only `PREVIEW_SECRET` and explain that `CMS_API_TOKEN` must authorize read/find access to Article and News drafts. In `frontend/config.ts`, add `previewSecret: string` to `AppConfig`, add `PREVIEW_SECRET` to `envVarKeys`, and load it with the existing `requireEnvVar()` fail-fast path. Do not add it to public runtime configuration or use a `NEXT_PUBLIC_` name.

Then generalize the secret comparison already present. Create `frontend/cms/secret.ts` and export `timingSafeCompareSecret(actual: string | null, expected: string): boolean` using the current equal-length guard plus Node `timingSafeEqual`. Do not add `import "server-only"`: the current Vitest aliases do not resolve it. Keep the helper Node-only by importing it only from server-owned CMS and route modules, with expected secrets supplied from non-public configuration. Remove the implementation from `frontend/cms/webhook.ts` and update `frontend/app/refresh/route.ts` to import the neutral helper. Preserve all webhook behavior and assertions.

Create `frontend/cms/preview.ts` as the pure trust-boundary owner. It must define `ContentStatus` as exactly `"draft" | "published"` and a parsed request containing `pathname` and `status`. Export a function such as `parsePreviewRequest(requestUrl: string, expectedSecret: string): PreviewRequest | null`. It must use `timingSafeCompareSecret`, require one of the two statuses, accept only a relative pathname consisting of `/articles/` or `/news/` followed by one valid encoded path segment, reject a query, fragment, empty segment, dot segment, encoded slash, encoded backslash, malformed percent encoding, extra segment, protocol-relative URL, or absolute URL, and return the normalized same-origin pathname. Keep this policy explicit and small; do not build a generic router or schema library.

Create `frontend/app/preview/route.ts`. Its GET handler parses the request with `config.previewSecret`. Return a generic `Unauthorized` response with status 401 for any invalid secret, status, or target, without echoing parameters. For `draft`, call `(await draftMode()).enable()`; for `published`, call `disable()`. Redirect with a same-origin `URL` constructed from the validated pathname and request URL. Its POST handler calls `disable()` and returns a 303 redirect to `/`, so the exit form changes the next request to GET. Do not cache this route, add middleware, or create another API endpoint.

Carry publication status through the existing data path. In `frontend/cms/client.ts`, export or import the `ContentStatus` type from the single chosen owner and add a required status argument to `CmsClient.getArticleBySlug` and `getNewsBySlug`, their object implementations, private functions, and `contentQuery`. Keep Event on `published`; either pass the literal from its private caller or retain a published-only helper, whichever yields the smallest clear diff. `contentQuery` must serialize the supplied status and preserve all current populate/filter behavior. Collection methods remain published-only.

In `frontend/cms/connector.ts`, add the same required status argument only to Article and News detail methods and pass it unchanged to the raw client. In `frontend/cms/data.ts`, keep `"use cache"`, `cacheLife("days")`, and all current cache tags. Inside `getArticleBySlug` and `getNewsBySlug`, read `{ isEnabled } = await draftMode()` and call the connector with `isEnabled ? "draft" : "published"`. Do not call `enable()` or `disable()` in a cached function. Do not add a second cache, a cache-busting query parameter, revalidation calls, or separate draft data functions; Next Draft Mode itself prevents draft results from being read from or written to the cache.

Add `frontend/components/shared/preview-banner.tsx`. It is an async Server Component that reads `isEnabled`, returns `null` when false, and otherwise renders a concise `role="status"` message plus a native `<form action="/preview" method="post">` containing an accessible `Exit preview` button. Add it to both Article and News detail route files immediately before their existing `PageSwitch`; do not change the page switch or page-specific presentation components. The banner should use the existing visual language and accessibility basics without introducing a client component or a styling abstraction.

Add focused tests. In `frontend/cms/preview.test.ts`, test a valid Article draft and valid News published request, a missing/wrong secret, each invalid status class, both external URL forms, unsupported `/events`, missing/extra slug segments, query/fragment injection, dot traversal, encoded separator, and malformed encoding. Exercise table-driven invalid cases rather than one test per branch. In the same file, add direct `timingSafeCompareSecret()` cases for equal, wrong, missing, and different-length values. Update `frontend/cms/client.test.ts` to prove Article and News detail calls serialize `status=draft` when passed draft and still preserve their current populate/filter query. Do not add route-handler mocks, DOM rendering tests, Strapi backend tests, browser automation, snapshots, or a separate test file for the helper.

Once future code passes, replace the temporary README status section with a concise `Preview` section that truthfully states: Preview is available for Article and News through Strapi Preview plus Next Draft Mode; draft requests bypass caching only for the editor's browser; `PREVIEW_CLIENT_URL`, matching backend/frontend `PREVIEW_SECRET`, and a least-privilege `CMS_API_TOKEN` are required; and other content types receive Preview only when the AGENTS rule applies. Do not teach routine Strapi, Next.js, or `.env` commands.

Finally, refresh the generated Strapi API surface and validate. Preview adds no content field or REST endpoint, so no semantic change is expected in `frontend/cms/schema.json`, `frontend/cms/schema.d.ts`, or `backend/types/generated/*`. Run the required generation commands anyway and inspect any diff. Do not run or request backend tests. Verify the backend builds and starts from a new empty SQLite database, then run frontend tests, check, and build. Perform the manual editor acceptance scenario only after automated validation is green.

## Milestones

### Milestone 1: Current documentation-only handoff

At the end of this milestone, this ExecPlan exists, README accurately says Preview is future work, and AGENTS instructs later agents when to implement Preview. No backend or frontend Preview code, environment contract, schema, generated artifact, dependency, or test changes exist. Run `git diff --check` and the searches in `Concrete Steps`; expect clean whitespace, explicit planned/not-implemented wording, and the proactive selective rule. Stop the current workflow here.

### Milestone 2: Future Strapi-to-Next Preview entry

At the end of this future milestone, Strapi exposes Preview only for Article and News and produces a URL accepted by one secure Next route. Invalid secrets, statuses, and redirect targets are rejected; draft enables the framework cookie and published disables it. Run the focused Preview tests and backend/frontend type checks. This milestone is independently verifiable by inspecting Strapi's Preview action and by requesting the route with valid and invalid parameters.

### Milestone 3: Future status-aware content through the existing pipeline

At the end of this future milestone, Article and News detail reads carry draft/published status through cached data → connector → raw client. Draft requests return current unpublished content without populating any cache, while normal visitors and collection routes remain published-only. The draft indicator and POST exit work on both detail page families. Run the client and Preview tests, full frontend tests, and production build.

### Milestone 4: Future generated surface, runtime proof, and final documentation

At the end of this future milestone, required generated artifacts have been refreshed and inspected, Strapi starts from an empty task-owned database, the manual editor scenario proves isolation and exit behavior for both content types, and README truthfully describes availability and configuration. Canonical backend/frontend validation and independent review must be green before handoff.

## Concrete Steps

Work from `/Users/federico.paolillo/src/cmsjs-tmpl` and remain on `main`. Record isolation before every workflow:

    git branch --show-current
    git status --short --branch
    git diff -- README.md AGENTS.md

Expected initial state for this plan is `main` tracking `origin/main`, with `style/` as unrelated untracked input. If other changes appear later, preserve them and use file- or hunk-scoped edits.

For the current documentation-only milestone, edit only this plan, `README.md`, and root `AGENTS.md`. Then run:

    rg -n "Preview|preview" README.md AGENTS.md .agents/plans/plan-preview-mode-for-articles-and-news.md
    git diff --check
    git status --short

The README result must explicitly include both `planned` and `not implemented` (or unambiguous equivalents). AGENTS must include the selective proactive rule and confirmation gate. No path under `backend/` or `frontend/` may appear as changed. Stop; do not execute later milestones in the current workflow.

In the future authorized workflow, the existing selected `cms/client.test.ts` and `cms/webhook.test.ts` files contain 8 tests; the full pre-change frontend baseline is 4 files and 14 tests. After adding `cms/preview.test.ts`, run the focused checks from `frontend/`:

    npm test -- cms/preview.test.ts cms/client.test.ts cms/webhook.test.ts
    npm run typecheck

Expect Vitest to pass all selected files, including the 8 existing client/webhook tests and the new Preview/helper cases, and expect Next route type generation plus TypeScript to finish without an error. Record the actual focused-test count; do not derive it from the 14-test full-suite baseline.

Refresh the generated surfaces from the repository root after all backend/frontend edits:

    mise run be:openapi
    mise run fe:openapi
    git diff -- frontend/cms/schema.json frontend/cms/schema.d.ts backend/types/generated

No semantic API or generated backend-type diff is expected because no content type changes. Do not run `mise run be:types` unless implementation actually changes backend content types and the user has first confirmed that change. If generation produces only unstable defaults, timestamps, or formatting, do not include that unrelated churn; restore only the generated-file hunks after inspecting them. If it shows a real API change, stop and reconcile it with this plan before continuing.

Run canonical automated validation from the repository root:

    mise run be:build
    npm --prefix frontend test
    mise run fe:check
    mise run fe:build
    git diff --check

Expect every command to exit zero. There are no Strapi backend tests. The frontend production build must succeed without a running CMS and must preserve SSR + ISR; no `generateStaticParams`, static export, or build-time content fetch may appear.

For the required empty-database startup check and manual acceptance, use only project-local ignored `.env` files and loopback ports in the required range. Use `127.0.0.1:65100` for Strapi and `127.0.0.1:65101` for Next. Preserve any existing local env files before changing them and restore their exact contents afterward. First prepare the local backend values:

    HOST=127.0.0.1
    PORT=65100
    DATABASE_CLIENT=sqlite
    DATABASE_FILENAME=.tmp/preview-validation.db
    PREVIEW_CLIENT_URL=http://127.0.0.1:65101
    PREVIEW_SECRET=<one high-entropy task-local value>
    WEBHOOKS_NEXTJS_TARGET=http://127.0.0.1:65101

Also include the repository's existing required webhook and application variables in the backend local file. Do not set machine or user environment variables. Do not reuse or delete the user's normal database. Ensure `backend/.tmp/preview-validation.db` does not exist, start Strapi with `npm --prefix backend run dev`, and observe a successful first boot plus admin creation against that empty file. Use Strapi's admin UI at `http://127.0.0.1:65100/admin` to create a task-local least-privilege API token authorized for Article and News find access.

Only after that token exists, create or complete the frontend local env file with:

    CMS_URL=http://127.0.0.1:65100/api
    CMS_MEDIA_URL=http://127.0.0.1:65100
    SITE_URL=http://127.0.0.1:65101
    PREVIEW_SECRET=<the exact same task-local value>
    CMS_API_TOKEN=<the task-local least-privilege token>

Also include the repository's existing required webhook and application variables in that frontend local file. `frontend/config.ts` requires `CMS_API_TOKEN` during initialization, so do not start Next before this file is complete. Then start Next with:

    npm --prefix frontend run dev -- --hostname 127.0.0.1 --port 65101

Create one Article and one News document using the existing schemas, publish an initial version, then change a visible title/body field without publishing. No schema editing is involved.

For each content type, select Preview in Strapi and choose the draft state. The iframe or opened frontend must land on the correct `/articles/<draft-slug>` or `/news/<draft-slug>` URL, show the unpublished values and `Draft preview` indicator, and return a response with private/no-store cache semantics. In a separate browser profile or private window without the draft cookie, the same public URL must continue to show the published values, or 404 if the entry has never been published. Refresh the editor preview after another unpublished edit and observe the new value immediately without invoking `/refresh`.

Then choose the published state from Strapi. It must show the published values and remove the draft indicator even if that browser previously held the draft cookie. Re-enter draft, submit `Exit preview`, observe a 303 transition to `/`, then revisit the detail URL and observe published content. Repeat the draft/published/exit proof for both Article and News. Invalid requests to `/preview` with a wrong secret, an external `url`, `/events/...`, or an invalid status must return 401 and must not set or clear the browser's current Draft Mode state.

Stop both processes. Remove only the task-owned `backend/.tmp/preview-validation.db` and any task-created local env files after restoring pre-existing local env content. Finally run:

    git status --short --branch
    git diff --stat
    git diff --check
    rg -n "generateStaticParams|output:[[:space:]]*['\"]export" frontend

`style/` must remain untouched and untracked. The final search must show no newly introduced static-generation contract violation.

## Validation and Acceptance

The current documentation milestone is accepted only when README says the feature is planned and not implemented, AGENTS contains the selective proactive implementation rule, the plan remains self-contained, no Preview code has been written, `git diff --check` passes, and `style/` is unchanged.

The later implementation is accepted only when all of the following observable behavior is proven:

- An authenticated Strapi editor sees a working Preview action for Article and News, but not for Event or Home Page.
- Draft Preview opens the canonical Article or News detail route and renders the latest unpublished identity and body content.
- Published Preview renders the published version and clears any prior Draft Mode cookie.
- A browser without the Draft Mode cookie never receives draft content and retains the existing cached SSR + ISR behavior.
- Draft responses bypass the fetch cache, `"use cache"` storage, and ISR response cache through native Next.js Draft Mode; no draft value becomes visible after exit or in a second browser.
- Preview entry rejects missing/wrong secrets, invalid status, malformed paths, unsupported content types, and any external/protocol-relative redirect target without echoing or logging the secret.
- The draft indicator appears only on Article and News detail requests in Draft Mode, exposes status semantics, and exits through a POST form.
- Article and News collection pages, Event/Home data, sitemap, robots, navigation, page switch, DTOs, mappers, webhook tag mapping, and published revalidation keep their current behavior.
- No content-type schema, dependency, custom Strapi route, `generateStaticParams`, static export, or build-time CMS dependency is introduced.
- README finally says Preview is available only after implementation and documents the three environment/token requirements accurately. AGENTS retains the proactive-but-selective rule and confirmation gate.
- `mise run be:build`, `npm --prefix frontend test`, `mise run fe:check`, and `mise run fe:build` all exit zero; Strapi starts from a new empty SQLite database; generated API artifacts contain no unexplained change.

## Idempotence and Recovery

Documentation and code edits are additive and safe to retry. Before touching an overlapping file, inspect its current diff and preserve user-owned hunks. Never use `git reset --hard` or `git checkout --`. Never edit, stage, or remove `style/`.

The future backend configuration is read-only with respect to content schemas and databases. If `PREVIEW_CLIENT_URL` or `PREVIEW_SECRET` is missing or invalid, startup should fail clearly through configuration rather than silently exposing a partial Preview feature. Correct only the project-local `.env` file and restart. Do not weaken secret validation or anonymous permissions to make acceptance pass.

If Strapi Preview returns no URL, verify the UID, status, document ID, populated `identity`, and non-empty slug. Do not add a generic fallback route. If Next returns 401, verify matching local secrets and the exact encoded relative path. If the detail route returns 404 only in draft, inspect the serialized `status=draft` request and API-token permission; do not fall back to published because Strapi 5 intentionally keeps statuses strict.

If the generated OpenAPI files change, inspect the diff before recovery. A real content/API difference contradicts this no-schema-change plan and requires stopping for a decision. Non-semantic generator churn should not be staged. Keep a pre-generation diff or copy so only the command's exact churn can be removed without disturbing user edits.

The empty-database check uses only `backend/.tmp/preview-validation.db`. Confirm the resolved filename is task-owned before removing it. Stop Strapi before deletion. Restore pre-existing local env files byte-for-byte and remove only env files created for this validation. Content created in the task-owned database is disposable; never run this acceptance against a user's normal database unless they explicitly authorize it.

If a future content-type change appears necessary, stop. Request explicit user confirmation, then apply the confirmed change through Strapi's API or admin UI, regenerate `be:types`, `be:openapi`, and `fe:openapi`, revise every section of this plan, and re-evaluate the scope. This recovery path is not pre-approval for such a change.

## Artifacts and Notes

Planning baseline:

    branch: main
    upstream: origin/main
    unrelated worktree input: untracked style/
    backend: Strapi 5.52.0
    frontend: Next 16.3.1, React 19.2.8, Vitest 3.2.7
    frontend tests: 4 files passed, 14 tests passed
    frontend check: Biome, Next typegen, and TypeScript passed

The authoritative local Next.js behavior is embedded in this plan. The installed sources inspected were:

    frontend/node_modules/next/dist/docs/01-app/02-guides/draft-mode.md
    frontend/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/draft-mode.md
    frontend/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md
    frontend/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
    frontend/node_modules/next/dist/server/request/draft-mode.d.ts

The installed Strapi 5.52 sources used to resolve the public documentation's typing ambiguity were:

    backend/node_modules/@strapi/types/dist/core/config/admin.d.ts
    backend/node_modules/@strapi/content-manager/dist/server/preview/controllers/validation/preview.js.map
    backend/node_modules/@strapi/content-manager/dist/server/preview/services/preview-config.js.map
    backend/node_modules/@strapi/content-manager/dist/server/preview/routes/preview.js.map

The stable URL contracts after future implementation are:

    Strapi admin -> GET http://127.0.0.1:65101/preview?url=%2Farticles%2F<encoded-slug>&secret=<secret>&status=draft
    Strapi admin -> GET http://127.0.0.1:65101/preview?url=%2Fnews%2F<encoded-slug>&secret=<secret>&status=published
    Preview banner -> POST /preview -> 303 /

Do not include actual secret values in this plan, source control, logs, screenshots, test names, error responses, or generated evidence.

## Interfaces and Dependencies

Use only installed Strapi, Next.js, `openapi-fetch`, Node standard-library crypto/URL APIs, and Vitest. Add no package and do not change package manifests.

In `backend/config/admin.ts`, retain the `Core.Config.Admin` return type and add its native `preview` property. The handler contract is the installed Strapi contract:

    handler(
      uid: string,
      params: {
        documentId: string;
        locale?: string;
        status?: string;
      },
    ): Promise<string | null>

It returns a Next preview URL only for `api::article.article` and `api::news-item.news-item`. `allowedOrigins` is a `string[]` containing only `PREVIEW_CLIENT_URL`'s origin.

In `frontend/config.ts`, the final interface adds:

    previewSecret: string;

In the single chosen preview policy module, define:

    export type ContentStatus = "draft" | "published";

    export interface PreviewRequest {
      pathname: string;
      status: ContentStatus;
    }

    export function parsePreviewRequest(
      requestUrl: string,
      expectedSecret: string,
    ): PreviewRequest | null;

In `frontend/cms/secret.ts`, define:

    export function timingSafeCompareSecret(
      actual: string | null,
      expected: string,
    ): boolean;

In `frontend/cms/client.ts`, Article and News detail methods become:

    getArticleBySlug(
      slug: string,
      status: ContentStatus,
    ): Promise<Result<ArticleData>>;

    getNewsBySlug(
      slug: string,
      status: ContentStatus,
    ): Promise<Result<NewsData>>;

`frontend/cms/connector.ts` exposes the same status argument with DTO result types. Public callers remain `frontend/cms/data.ts`; routes do not call the raw client or connector directly.

`frontend/app/preview/route.ts` exports native App Router handlers:

    export async function GET(request: Request): Promise<Response>;
    export async function POST(request: Request): Promise<Response>;

`frontend/components/shared/preview-banner.tsx` exports one async `PreviewBanner` Server Component with no props. Article and News detail routes render it without changing `PageSwitch`.

Revision note: 2026-08-30 / Planner — Created the initial self-contained ExecPlan after current-worktree inspection, Context7 research for Strapi 5 and Next.js, installed Next.js 16.3.1 guide/type inspection, installed Strapi 5.52 Preview type/source inspection, pipeline tracing, and green baseline frontend validation. The plan separates the current documentation-only deliverables from the later implementation, resolves status propagation, secret/open-redirect handling, cache isolation, generated-artifact expectations, empty-database validation, manual acceptance, recovery, and the explicit content-type confirmation gate.

Revision note: 2026-08-30 20:25Z / Implementer — Completed the approved documentation-only milestone in `README.md` and `AGENTS.md`; Preview implementation remains explicitly out of scope pending a separately authorized workflow and independent review.

Revision note: 2026-08-30 20:35Z / Implementer — Corrected bounded review findings: omitted the Vitest-unresolved `server-only` marker from the proposed helper, added direct planned comparator coverage and accurate 8-test focused-baseline wording, and ordered fresh-database token creation before frontend startup.

Revision note: 2026-08-30 20:37Z / Coordinator — Recorded independent `APPROVED` / `REVIEW_READY` evidence, closed the current workflow's review progress, distinguished future implementation review, and finalized the documentation-only outcome without changing implementation scope or technical decisions.
