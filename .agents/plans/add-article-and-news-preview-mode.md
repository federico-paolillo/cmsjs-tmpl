# Add Article and News Preview mode

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Maintain this document in accordance with `.agents/docs/PLANS.md` from the repository root.

## Purpose / Big Picture

After this change, an authenticated Strapi editor can open an existing Article or News document in the Content Manager, select Preview, and see the selected draft or published version at its real Next.js detail URL. Draft Preview shows unpublished edits immediately in only that editor's browser. Visitors without the Next.js Draft Mode cookie continue to receive the existing server-rendered and incrementally revalidated published page.

The implementation uses Strapi 5.52.0's native Preview handler and Next.js 16.3.1's native Draft Mode. It does not change either content type, add a dependency, add a Strapi endpoint, or create a second CMS pipeline. A visible draft indicator and POST exit action let an editor confirm and end the preview session. The final `README.md` explains availability and the small environment contract.

The direct prompt explicitly authorizes this work for the existing Article and News types, so the repository's content-type confirmation gate is satisfied. No schema edit is necessary. If implementation unexpectedly requires any content-type change, stop and obtain a new explicit confirmation before applying it through Strapi's API or admin UI.

## Progress

- [x] (2026-08-30 20:45Z) Read the authoritative task, root and frontend `AGENTS.md`, `.agents/docs/PLANS.md`, the Ponytail and canonical-validation skills, the current worktree, the prior deleted planning artifact for background, and all relevant backend/frontend code and tests.
- [x] (2026-08-30 20:45Z) Read current Strapi Preview documentation through Context7, installed Strapi 5.52.0 Preview types and server implementation, and installed Next.js 16.3.1 Draft Mode, Cache Components, Route Handler, and redirect documentation.
- [x] (2026-08-30 20:45Z) Established the current validation baseline: `npm --prefix frontend test` passes 4 files and 14 tests; `mise run fe:check` passes Biome, Next route type generation, and TypeScript; `mise tasks` exposes the canonical backend/frontend tasks recorded below.
- [x] (2026-08-30 20:45Z) Designed the minimal native implementation and created this self-contained ExecPlan without modifying application or documentation files.
- [x] (2026-08-30 20:47Z) Verified the ExecPlan contains every required living section, has no whitespace errors, and is the only worktree addition.
- [x] (2026-08-31 06:24Z) Added native Strapi Preview configuration and the backend/frontend environment contract without changing a content type.
- [x] (2026-08-31 06:24Z) Added secure Next.js Preview entry/exit behavior and focused trust-boundary tests.
- [x] (2026-08-31 06:24Z) Carried Article and News publication status through the existing cached CMS pipeline and added focused query tests.
- [x] (2026-08-31 06:24Z) Added the editor-visible draft indicator, finalized README availability/setup wording, and retained the already-correct root AGENTS guidance.
- [x] (2026-08-31 06:27Z) Completed generated-artifact refresh, canonical validation, empty-database startup, and HTTP Preview entry/exit acceptance. The unavailable browser-mediated Content Manager walkthrough is recorded as an optional unexecuted manual observation, not a blocking acceptance gate.
- [x] (2026-08-31 06:27Z) Recorded implementation evidence, validation results, and the optional browser-observation limitation in this living plan.
- [x] (2026-08-31 06:40Z) Remediated Preview exit to preserve the deployment origin with a relative `Location: /`, corrected the CMS API-token contract, and verified the response and cleared Draft Mode cookie with a mismatched public Host header.
- [x] (2026-08-31 06:44Z) Independent review approved the task after one remediation cycle and independently revalidated 31 frontend tests, backend/frontend builds and checks, Draft Mode entry/exit behavior, scope boundaries, and whitespace.

## Surprises & Discoveries

- Observation: The worktree is clean but the local `main` branch is one commit ahead of `origin/main`.
  Evidence: `git status --short --branch` prints only `## main...origin/main [ahead 1]`. The ahead commit deletes two obsolete plans; implementation must preserve it and must not rewrite history.

- Observation: Root `AGENTS.md` already contains the task's requested proactive-but-selective Preview instruction and explicitly retains the content-type confirmation gate.
  Evidence: Its Architecture Guidelines say to implement the shared Strapi Preview plus Next Draft Mode path when unpublished presentation materially helps editors, not mechanically for every type, and say the explicit confirmation gate still applies. Do not create a no-op wording diff; verify this rule remains present at handoff.

- Observation: `README.md` still says Preview is planned and links to a plan deleted by the local ahead commit.
  Evidence: The `Preview status` section points at `.agents/plans/plan-preview-mode-for-articles-and-news.md`. Implementation must replace that section with truthful availability/setup text and must not preserve the stale link.

- Observation: Article and News already meet the schema prerequisite for Preview.
  Evidence: `backend/src/api/article/content-types/article/schema.json` and `backend/src/api/news-item/content-types/news-item/schema.json` both contain `"draftAndPublish": true`; their UIDs are `api::article.article` and `api::news-item.news-item`. Their shared slug is nested at `identity.slug`.

- Observation: The installed Strapi Preview type requires an array for allowed origins even though a current documentation excerpt shows a scalar value.
  Evidence: `backend/node_modules/@strapi/types/dist/core/config/admin.d.ts` declares `PreviewConfig.allowedOrigins?: string[]`. Use `[previewClientUrl.origin]`.

- Observation: Strapi validates collection Preview requests before calling the configured handler and supplies a default status.
  Evidence: `backend/node_modules/@strapi/content-manager/dist/server/preview/controllers/validation/preview.js` requires `documentId` for collection types and defaults status to `draft` when Draft & Publish is enabled, otherwise `published`. The public handler type still weakens status to optional `string`, so application code must accept only `draft` and `published`.

- Observation: Next.js 16.3.1 Draft Mode provides the required cache isolation without a parallel uncached data layer.
  Evidence: `frontend/node_modules/next/dist/docs/01-app/02-guides/draft-mode.md`, `03-api-reference/04-functions/draft-mode.md`, and `03-api-reference/01-directives/use-cache.md` state that enabled Draft Mode bypasses fetch cache, all `"use cache"` reads/writes, `unstable_cache`, and the ISR response cache. `isEnabled` may be read inside a `"use cache"` scope, but `enable()` and `disable()` must run in a Route Handler or Server Action.

- Observation: Draft Mode cache bypass alone is insufficient because the raw Strapi detail query explicitly asks for published content.
  Evidence: `frontend/cms/client.ts` builds every detail query through `contentQuery()`, which hard-codes `status: "published"`. Article and News must pass an explicit status through data, connector, and client; Event and every list read remain published-only.

- Observation: The existing webhook secret comparison is reusable application logic under a webhook-specific name and lacks direct coverage.
  Evidence: `frontend/cms/webhook.ts` uses Node's `timingSafeEqual` in `timingSafeCompareWebhookSecret()`, while `frontend/cms/webhook.test.ts` tests only payload parsing. Preview creates a second real caller, so move the algorithm once to a neutral `frontend/cms/secret.ts` and test it there through the Preview test file.

- Observation: Pure frontend helpers imported by Vitest cannot currently carry Next's `server-only` marker.
  Evidence: `frontend/vitest.config.ts` aliases only `@cmsjs`; it does not resolve `server-only`. Keep the pure Preview and secret-policy modules marker-free and import them only from server-owned route/CMS modules. Do not add a test-only alias or dependency.

- Observation: Generated API types should not change semantically.
  Evidence: Preview adds admin configuration and changes request selection only; it adds no content field or REST endpoint. The required `be:openapi` and `fe:openapi` tasks must still run and their output diff must be inspected. `be:types` is required only if an authorized backend content-type/type definition changes, which this plan does not expect.

- Observation: The OpenAPI generator rewrote formatting and generated timestamp defaults despite no API change.
  Evidence: `mise run be:openapi` followed by `mise run fe:openapi` changed only JSON formatting and generated default timestamps. The generator-owned non-semantic churn was restored with a scoped patch; `git diff -- frontend/cms/schema.json frontend/cms/schema.d.ts backend/types/generated` is empty.

- Observation: The available browser controller cannot execute the optional Content Manager walkthrough in this environment.
  Evidence: Browser bootstrap for `http://127.0.0.1:65100/admin` returned `No browser is available`. No browser, cookie store, or ignored local environment file was inspected. Focused unit tests, native builds, empty-database startup, and HTTP Draft Mode checks remain the proportionate acceptance evidence under the repository test policy.

- Observation: Constructing the Preview exit redirect from `request.url` can emit the internal server origin when deployment host handling differs.
  Evidence: The earlier runtime exit response used an absolute internal-origin Location. After returning status 303 with `Location: /`, a POST with `Host: public.example` returned `303`, `Location: /`, and a clearing `__prerender_bypass` cookie.

## Decision Log

- Decision: Configure Preview only for `api::article.article` and `api::news-item.news-item`.
  Rationale: These are the requested Draft & Publish types and already map to `/articles/[slug]` and `/news/[slug]`. Event, Home Page, collection pages, localization, and generic Preview registration are outside scope.
  Date/Author: 2026-08-30 / Planner

- Decision: Use Strapi's built-in Preview handler and Next.js 16.3.1's built-in Draft Mode, with no dependency or custom Strapi endpoint.
  Rationale: The frameworks already own the required admin integration, browser cookie, and cache bypass. Extra infrastructure would duplicate native behavior.
  Date/Author: 2026-08-30 / Planner

- Decision: Add `PREVIEW_CLIENT_URL` and `PREVIEW_SECRET` to backend configuration, the matching non-public `PREVIEW_SECRET` to frontend configuration, and use the existing `CMS_API_TOKEN` for server-side Strapi reads.
  Rationale: Strapi needs the frontend origin and shared secret to construct the entry URL. Next needs the same secret to authenticate it. The existing bearer-token path already owns CMS authentication; the token must grant least-privilege read access for every CMS content type the site serves, including Article and News find access so draft content is not exposed through public-role permissions.
  Date/Author: 2026-08-30 / Planner

- Decision: Fetch the requested Strapi document status inside the Preview handler before constructing the path.
  Rationale: A draft may change `identity.slug`, while published comparison must use the published slug. `strapi.documents(uid).findOne({ documentId, status, populate: { identity: true } })` makes the Preview URL correspond to the selected state and returns no URL when that state does not exist.
  Date/Author: 2026-08-30 / Planner

- Decision: Accept only two local path families with exactly one validated slug segment, then redirect to the canonical encoded path returned by the parser.
  Rationale: This blocks open redirects, protocol-relative targets, traversal, query/fragment injection, unsupported content types, and encoded path separators. The Strapi handler is already the trusted existence check, so the Next entry route does not need a second CMS read.
  Date/Author: 2026-08-30 / Planner

- Decision: Interpret Preview status `draft` as enabling Draft Mode and `published` as disabling it before redirecting.
  Rationale: Strapi exposes both states. Explicitly disabling on published Preview prevents a previous draft cookie from affecting the comparison.
  Date/Author: 2026-08-30 / Planner

- Decision: Change only Article and News single-document reads to select `draft` or `published` through `await draftMode()` inside their existing cached data functions.
  Rationale: Next 16.3.1 explicitly permits `isEnabled` inside `"use cache"` and automatically prevents draft results from being read from or written to cache. Keeping the existing raw client → connector → cached data path preserves SSR + ISR and avoids duplicate draft functions.
  Date/Author: 2026-08-30 / Planner

- Decision: Show one shared accessible draft indicator on Article and News detail routes and exit with a native POST form handled by the same `/preview` Route Handler file.
  Rationale: Editors need an unambiguous state indicator and deterministic exit. GET is required for the Strapi-admin entry link; POST is the correct method for clearing the cookie. One route and one small Server Component are sufficient.
  Date/Author: 2026-08-30 / Planner

- Decision: Move the existing timing-safe comparison to a neutral helper rather than duplicate it.
  Rationale: Webhook and Preview are now two genuine consumers of the same security rule. Node's standard-library implementation already exists in the repository and should remain the single owner.
  Date/Author: 2026-08-30 / Planner

- Decision: Do not change schemas, DTOs, mappers, page-switch dispatch, webhook tag mapping, collection reads, sitemap, robots, navigation, or Next configuration.
  Rationale: Preview changes publication selection and editor state, not content shape, discovery, presentation dispatch, or published-cache invalidation.
  Date/Author: 2026-08-30 / Planner

- Decision: Unit-test pure request validation and query serialization, then use native builds plus a manual editor scenario for framework cookie and Strapi-admin behavior.
  Rationale: Secret, redirect-target, and status parsing are application trust boundaries; serialized `status` is application behavior. Reimplementing Next's cookie machinery in tests or adding browser automation would duplicate framework behavior and violate repository test constraints.
  Date/Author: 2026-08-30 / Planner

- Decision: Use a semantic `<output>` element for the draft indicator instead of explicitly applying `role="status"`.
  Rationale: `<output>` has the required status semantics and satisfies the repository's accessibility lint without adding a wrapper or client behavior.
  Date/Author: 2026-08-31 / Worker

- Decision: Treat the unavailable Content Manager walkthrough as an optional manual observation rather than a blocking validation gate.
  Rationale: Repository policy limits automated validation to unit and integration tests and the task does not designate a fresh browser walkthrough as a blocking gate. The completed focused tests, native builds, empty-database startup, and HTTP cookie behavior directly cover the implementation's stable boundaries.
  Date/Author: 2026-08-31 / Coordinator and Worker

- Decision: Make Preview exit return relative `Location: /` with status 303.
  Rationale: A relative target preserves the browser's public deployment origin and avoids exposing an internal request URL, while native Draft Mode still attaches its clearing cookie to the Route Handler response.
  Date/Author: 2026-08-31 / Worker

## Outcomes & Retrospective

Implementation completed the native Strapi and Next Preview path without a schema, dependency, DTO, mapper, dispatcher, discovery, or cache-architecture change. The full frontend suite passes 5 files / 31 tests; `mise run be:build`, `mise run fe:check`, and `mise run fe:build` pass with task-local Preview values; `git diff --check` passes. Strapi started successfully from the task-owned empty SQLite database at `backend/.tmp/preview-validation.db`, which was removed after shutdown. Next runtime requests proved validated draft entry returns 307 plus the Draft Mode cookie, published entry returns 307 plus cookie removal, an external target returns 401 without a cookie mutation, and POST exit returns 303 with relative `Location: /` plus cookie removal even with a mismatched public Host header.

Independent review approved the completed implementation after one remediation cycle. The cycle corrected the Preview exit redirect to preserve the public deployment origin and corrected the shared CMS API-token permission contract; the reviewer independently confirmed the fixes and all required validation.

The environment has no available browser controller, so the optional Strapi Content Manager click-through (creating Article and News documents, Previewing draft/published values, and verifying second-profile isolation) remains unexecuted. This does not block handoff: the repository limits automated validation to unit and integration tests, and the direct task does not label this fresh walkthrough as a blocking acceptance gate. The completed focused tests, native builds, empty-database startup, and route-level Draft Mode behavior are the proportionate authoritative evidence. A reviewer with an available browser may perform the walkthrough as an additional observation.

## Context and Orientation

This repository combines a Strapi 5.52.0 backend in `backend/` with a Next.js 16.3.1 App Router frontend in `frontend/`. The frontend uses server-side rendering plus incremental static regeneration, abbreviated SSR + ISR: a request renders CMS content on the server and Next reuses the response until cache lifetime or an explicit tag invalidation requires refresh. `frontend/next.config.ts` enables Cache Components. A function containing `"use cache"` participates in that cache.

Published content follows one pipeline. `frontend/cms/client.ts` performs raw Strapi REST calls through `openapi-fetch` and serializes nested query objects into Strapi's bracket notation. `frontend/cms/connector.ts` maps raw responses through `frontend/cms/mappers.ts` into the frontend data-transfer objects in `frontend/cms/model.ts`. `frontend/cms/data.ts` wraps connector calls in `"use cache"`, `cacheLife("days")`, and content tags. Detail routes at `frontend/app/(content)/articles/[slug]/page.tsx` and `frontend/app/(content)/news/[slug]/page.tsx` call those data functions and pass the result to `frontend/components/page-switch.tsx`. Preview must extend this path rather than bypass it.

Published-cache invalidation is separate. Strapi's webhook reaches `frontend/app/refresh/route.ts`, which authenticates the request, maps the event through `frontend/cms/tags.ts`, and calls `revalidateTag`. Preview must not alter that path. Draft Mode bypasses caches for the editor's cookie-bearing requests; publishing still uses the existing webhook to refresh visitor-facing content.

Strapi Preview is the editor-facing feature configured in `backend/config/admin.ts`. For an Article or News entry, Strapi calls its configured handler with the content-type UID, document ID, optional locale, and selected `draft` or `published` status. The handler returns a URL such as `/preview?url=%2Farticles%2Fexample&secret=...&status=draft`. Returning `null` removes Preview for unsupported content types or unavailable states.

Next.js Draft Mode is a browser-scoped cache bypass implemented by the `__prerender_bypass` cookie. `frontend/app/preview/route.ts` will authenticate the Strapi URL, validate its local target, enable or disable the cookie, and redirect to the normal detail route. Article and News cached data functions will inspect `draftMode().isEnabled`: draft requests query Strapi with `status=draft`, and normal or published requests query `status=published`. A browser without the cookie stays on the existing cache path.

Configuration is server-only. `backend/.env.example` documents backend values. `frontend/.env.example` documents frontend values, while `frontend/config.ts` validates and freezes them and `frontend/deps.ts` constructs the existing CMS client and connector. `PREVIEW_SECRET` must never use a `NEXT_PUBLIC_` prefix or appear in logs, responses, screenshots, generated evidence, or committed local environment files.

The repository currently has ignored local `backend/.env` and `frontend/.env` files. They may contain user-owned secrets. Do not inspect, overwrite, stage, or disclose their contents. If runtime acceptance needs temporary values, preserve each file byte-for-byte, use project-local ignored files only, and restore it afterward.

## Plan of Work

Begin with backend Preview configuration. In `backend/.env.example`, add `PREVIEW_CLIENT_URL` as the absolute frontend origin and `PREVIEW_SECRET` as a matching high-entropy shared token. In `backend/config/admin.ts`, preserve all current auth, API-token, transfer, encryption, and flag settings. Read both values, fail startup clearly when either is missing or the URL is invalid, and add the native `preview` property with `enabled: true`, `allowedOrigins: [previewClientUrl.origin]`, and one asynchronous handler.

Keep private route/path helpers in `backend/config/admin.ts` because only this configuration uses them. The handler must immediately return `null` unless the UID is Article or News, `documentId` is non-empty, and status is exactly `draft` or `published`. Fetch the selected version through `strapi.documents(uid).findOne({ documentId, status, populate: { identity: true } })`. Validate that the returned document has a non-empty string `identity.slug`. Select `/articles/` or `/news/`, encode the slug as one path segment with `encodeURIComponent`, create the entry URL relative to `PREVIEW_CLIENT_URL`, and set exactly `url`, `secret`, and `status` through `URL.searchParams`. Return `null` for a missing selected version or invalid slug. Ignore locale because neither current content type uses localization. Never log the constructed URL.

Next add the frontend configuration and pure Preview policy. In `frontend/.env.example`, document required `PREVIEW_SECRET` and say it must equal the backend value. In `frontend/config.ts`, add `previewSecret: string` to `AppConfig`, add `PREVIEW_SECRET` to `envVarKeys`, and load it with the existing `requireEnvVar` function. Do not expose it in client-side code.

Create `frontend/cms/secret.ts` and move the existing Node `timingSafeEqual` comparison from `frontend/cms/webhook.ts` into an exported `timingSafeCompareSecret(actual: string | null, expected: string): boolean`. Preserve the current behavior: compare byte lengths before calling `timingSafeEqual`, treat a missing value as an empty byte sequence, and never throw on different lengths. Change `frontend/app/refresh/route.ts` to import and call the neutral helper, then remove the old webhook-specific export and crypto import. This refactor must not change webhook responses or authentication semantics.

Create `frontend/cms/preview.ts` as the single owner of Preview request policy and publication status. Export `ContentStatus = "draft" | "published"`, `PreviewRequest`, and `parsePreviewRequest(requestUrl, expectedSecret)`. Parse with the standard `URL` class. Read `secret`, `status`, and `url`; authenticate with `timingSafeCompareSecret`; accept only the two statuses; and accept only `/articles/<one-segment>` or `/news/<one-segment>`. Decode the slug inside a `try` block, reject empty values, `.` or `..`, decoded `/` or backslash, extra path segments, raw query/fragment suffixes, absolute/protocol-relative URLs, and malformed encoding. Return a canonical pathname rebuilt from the known prefix plus `encodeURIComponent(decodedSlug)` so the Route Handler never redirects to caller-controlled URL syntax. Return `null` for every invalid request and do not include parameter values in errors.

Create `frontend/app/preview/route.ts`. Its GET handler calls `parsePreviewRequest(request.url, config.previewSecret)` before touching Draft Mode. Return a generic `Unauthorized` response with status 401 for every invalid secret, status, or target. For `draft`, call `(await draftMode()).enable()`; for `published`, call `disable()`. Call `redirect(preview.pathname)` from `next/navigation` only after validation; the installed Next guide defines this as a 307 Route Handler redirect. Its POST handler calls `disable()` and returns status 303 with relative `Location: /` so the browser follows with GET at its public origin. Do not add caching directives, middleware, another API route, or a client component.

Carry status through the existing CMS path. In `frontend/cms/client.ts`, import `ContentStatus` and add a required status argument to Article and News detail methods in `CmsClient`, their frozen object implementation, their private functions, and `contentQuery`. Preserve Event as published-only by passing the literal `"published"` from its current private path. The supplied status must be serialized alongside the existing populate and slug filter. Collection methods remain published-only. In `frontend/cms/connector.ts`, add the same required status argument only to Article and News detail methods and pass it unchanged to the raw client. Do not change mapping.

In `frontend/cms/data.ts`, preserve `"use cache"`, `cacheLife("days")`, and the current cache tags. Inside `getArticleBySlug` and `getNewsBySlug`, read `{ isEnabled } = await draftMode()` and call the connector with `isEnabled ? "draft" : "published"`. Do not toggle Draft Mode in a cached function. Do not add separate draft data functions, a second cache, cache-busting parameters, or Preview-specific revalidation.

Create `frontend/components/shared/preview-banner.tsx`. It is an async Server Component with no props. Read `draftMode().isEnabled`, return `null` when false, and otherwise render a concise semantic `<output>` draft message and a native `<form action="/preview" method="post">` containing an accessible `Exit preview` button. Use existing Tailwind presentation conventions without a new styling abstraction. Render it immediately before the existing `PageSwitch` in both Article and News detail page components, using a fragment if needed. Do not change `PageSwitch` or page-specific presentation components.

Add focused tests at the owning boundaries. Create `frontend/cms/preview.test.ts`. Cover a valid Article draft request and valid News published request, equal/wrong/missing/different-length secrets, missing and invalid status, absolute and protocol-relative external targets, unsupported `/events`, missing or extra slug segments, raw query/fragment injection, dot traversal, encoded slash and backslash, and malformed percent encoding. Use a table for invalid targets rather than one test per branch. Update `frontend/cms/client.test.ts` to call Article and News detail methods with `draft` and prove their outgoing URLs contain `status=draft` while retaining the existing identity/section population and slug filter. Existing list-method assertions must remain published-only. Do not add route mocks, DOM tests, snapshots, Strapi backend tests, browser automation, or test-only production seams.

Replace `README.md`'s stale `Preview status` section with a concise `Preview` section after automated behavior is working. State that Preview is available for Article and News through Strapi Preview plus Next Draft Mode; draft requests bypass caches only for the editor's browser; backend `PREVIEW_CLIENT_URL`, matching backend/frontend `PREVIEW_SECRET`, and a least-privilege server-only `CMS_API_TOKEN` with read access for all CMS content the site serves, including draft Article and News reads, are required. Mention that additional Draft & Publish types receive Preview selectively under the root AGENTS rule. Do not teach routine `.env`, Strapi, or Next commands. Root `AGENTS.md` already satisfies the requested guidance; verify its wording remains present and do not edit it unless concurrent work has removed or contradicted that requirement.

Finally, refresh generated API artifacts and validate. Run `mise run be:openapi` then `mise run fe:openapi` even though no semantic API diff is expected. Run `mise run be:types` only if an explicitly authorized backend content-type/type definition changed; if that becomes necessary, first revise this plan and obtain the required confirmation. Inspect all generated diffs. Run the full canonical backend/frontend commands, then start Strapi from a fresh task-owned SQLite database and perform the HTTP Preview entry/exit checks. The editor scenario in `Validation and Acceptance` is an optional manual observation when a browser is available, not a blocking gate. Record exact outputs and update every living section before handoff.

## Milestones

### Milestone 1: Strapi-to-Next Preview entry is secure

At the end of this milestone, Strapi exposes Preview only for Article and News and produces URLs accepted by one Next Route Handler. Invalid secrets, statuses, malformed paths, unsupported types, and external targets are rejected before the Draft Mode cookie changes. Draft status enables the cookie; published status disables it. Focused Preview-policy tests, backend build, and frontend type checking prove this milestone independently.

### Milestone 2: Draft data uses the existing SSR + ISR pipeline

At the end of this milestone, Article and News detail requests pass an explicit status through cached data → connector → raw client. Cookie-bearing draft requests return current unpublished content without reading or populating Next caches; other requests remain published and cached. Event, lists, discovery, webhook revalidation, mapping, and dispatch are unchanged. Client serialization tests, the full frontend suite, and the production frontend build prove the code path.

### Milestone 3: Editor experience and documentation are complete

At the end of this milestone, Article and News detail pages display a draft-only status indicator with a working POST exit, README accurately describes availability/setup, and root AGENTS retains the selective proactive rule plus content-type confirmation gate. A Strapi editor can preview both draft and published states while a second browser remains isolated on published content.

### Milestone 4: Generated surfaces and canonical validation are green

At the end of this milestone, required generated API artifacts have been refreshed and inspected, all applicable canonical commands exit zero, Strapi starts from an empty task-owned database without backend tests, manual acceptance passes for both content types, and no schema, dependency, architecture, or unrelated worktree change remains. The living plan records the final evidence and outcome.

## Concrete Steps

Work from `/Users/federico.paolillo/src/cmsjs-tmpl`. Before editing, preserve the current clean state and local ahead commit:

    git branch --show-current
    git status --short --branch
    git log -1 --oneline

Expected planning baseline:

    main
    ## main...origin/main [ahead 1]
    1d62a24 wip: cleanup

Use `apply_patch` and inspect existing diffs before touching any file. Never inspect or print ignored `.env` contents. Implement Milestone 1 in the backend/front-end configuration and Preview policy files named above, then run from the repository root:

    npm --prefix frontend test -- cms/preview.test.ts cms/webhook.test.ts
    mise run be:build
    mise run fe:typecheck
    git diff --check

Expect the selected Vitest files to pass, Strapi's TypeScript/admin build to accept the native Preview configuration, Next route types plus TypeScript to pass, and no whitespace error. Record actual test counts rather than predicting them.

Implement status propagation and update the client tests. Then run:

    npm --prefix frontend test -- cms/preview.test.ts cms/client.test.ts cms/webhook.test.ts
    mise run fe:check
    git diff --check

Expect the raw Article and News calls to serialize `status=draft` in the new assertions, the existing published collection assertions to pass, and Biome/Next type generation/TypeScript to finish without errors.

Add the banner and README wording, verify AGENTS, and search for accidental architecture expansion:

    rg -n "Preview|preview|PREVIEW_" README.md AGENTS.md backend/.env.example frontend/.env.example backend/config/admin.ts frontend
    rg -n "generateStaticParams|output:[[:space:]]*['\"]export" frontend
    git diff -- package.json backend/package.json frontend/package.json backend/src/api frontend/cms/mappers.ts frontend/cms/model.ts frontend/components/page-switch.tsx frontend/app/sitemap.ts frontend/app/robots.ts

The first search must show the documented environment contract, implemented route/policy, and existing selective AGENTS rule. The second must show no newly introduced static-generation violation. The scoped diff must show no dependency, schema, DTO, mapper, dispatcher, or discovery changes.

Refresh the generated surfaces after all backend/frontend edits:

    mise run be:openapi
    mise run fe:openapi
    git diff -- frontend/cms/schema.json frontend/cms/schema.d.ts backend/types/generated

No semantic generated diff is expected. If a real API change appears, stop and reconcile it with this no-schema-change plan. Do not run `be:types` merely because backend configuration changed. If an authorized backend content type or generated type definition actually changes, run `mise run be:types` after confirmation and revise this plan.

Run the full applicable canonical validation from the repository root:

    mise run be:build
    npm --prefix frontend test
    mise run fe:check
    mise run fe:build
    git diff --check

Every command must exit zero. The current pre-change baseline is 4 Vitest files and 14 tests; record the new actual totals. The frontend production build must succeed without a running CMS and preserve the existing request-time content model. There are no Strapi backend tests; do not add or request any.

For the empty-database startup and editor-visible acceptance, use only ignored project-local environment files and loopback ports in the required range. Preserve any pre-existing `backend/.env` and `frontend/.env` byte-for-byte without displaying them, and restore them after validation. Use `127.0.0.1:65100` for Strapi and `127.0.0.1:65101` for Next. Prepare task-local backend values including:

    HOST=127.0.0.1
    PORT=65100
    DATABASE_CLIENT=sqlite
    DATABASE_FILENAME=.tmp/preview-validation.db
    PREVIEW_CLIENT_URL=http://127.0.0.1:65101
    PREVIEW_SECRET=<one high-entropy task-local value>
    WEBHOOKS_NEXTJS_TARGET=http://127.0.0.1:65101

Also provide the repository's existing required application, admin, encryption, and webhook values in the local backend file. Do not set or change machine/user environment variables. Confirm `backend/.tmp/preview-validation.db` is task-owned and absent, then start Strapi:

    npm --prefix backend run dev

Observe a successful first boot and automatic admin creation against the empty database. Use the Strapi admin UI at `http://127.0.0.1:65100/admin` to create a task-local least-privilege API token with read access for all CMS content the site serves, including Article and News find access. Token creation changes only the task-owned validation database, not a content-type schema.

Only after the token exists, prepare the local frontend values including:

    NEXT_PUBLIC_APP_VERSION=preview-validation
    CMS_URL=http://127.0.0.1:65100/api
    CMS_MEDIA_URL=http://127.0.0.1:65100
    CMS_API_TOKEN=<the task-local least-privilege token for all served CMS reads>
    CMS_WEBHOOKS_SECRET_HEADER=<matching local webhook header name>
    CMS_WEBHOOKS_SECRET_HEADER_VALUE=<matching local webhook value>
    SITE_URL=http://127.0.0.1:65101
    PREVIEW_SECRET=<the exact same task-local value>

Start Next only after this file is complete:

    npm --prefix frontend run dev -- --hostname 127.0.0.1 --port 65101

Next's installed documentation notes that local HTTP Preview in an embedded cross-origin frame requires the browser to allow third-party cookies and local storage. Configure only the validation browser as needed; do not weaken application cookie or security settings.

When a manual browser is available, create one Article and one News document using the existing schemas, publish an initial version, then change visible title/body values and, for at least one document, the slug without publishing. Do not edit a schema. For each type, select Strapi Preview in draft state. It should open the draft's canonical `/articles/<slug>` or `/news/<slug>` route, show unpublished values and the draft indicator, and return private/no-store cache semantics. Refresh after another unpublished edit and observe the new value without calling `/refresh`. This is an additional manual observation, not a blocking gate.

For that optional observation, use a second browser profile without the Draft Mode cookie to visit the public detail URL. It should continue to show the published values, or 404 if that state was never published. Select published Preview in the editor browser; it should show published values and remove the draft indicator even after a prior draft session. Re-enter draft, submit `Exit preview`, observe a 303 redirect to `/`, then revisit the detail route and see published content. Repeat the draft/published/isolation/exit proof for Article and News.

Send representative invalid GET requests to `/preview` using a wrong secret, external target, unsupported `/events/...` target, and invalid status. Each must return 401 without setting or clearing the existing Draft Mode state and without echoing the secret. Do not record the valid secret in terminal transcripts or screenshots.

Stop both processes. Remove only `backend/.tmp/preview-validation.db` after confirming the resolved target and restore the original ignored env files exactly. Then run:

    git status --short --branch
    git diff --stat
    git diff --check
    git diff --name-only

Only task files and any inspected generated artifacts may appear. Preserve the local ahead commit. Update `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` with exact evidence before review and handoff.

## Validation and Acceptance

Acceptance is based on observable behavior and exact validation, not file presence alone.

The Content Manager click-through below is an optional manual observation when a browser is available. It is not a blocking release gate: source-level focused tests, native builds, empty-database startup, and HTTP Draft Mode cookie checks are the required validation for this task.

An authenticated Strapi editor must see working Preview for Article and News and no Preview URL for Event or Home Page. Draft Preview must use the draft `identity.slug`, land on the canonical detail route, and render the latest unpublished content. Published Preview must use the published slug/content and clear any earlier Draft Mode cookie.

A browser without the Draft Mode cookie must never receive draft content. It must retain the existing cached SSR + ISR behavior. Draft responses must bypass fetch caching, `"use cache"` storage, and ISR through native Next Draft Mode; publishing must continue to refresh public caches through the existing webhook.

Preview entry must reject missing or wrong secrets, missing or invalid status, unsupported route families, missing or extra slug segments, malformed encoding, traversal, query/fragment injection, absolute URLs, and protocol-relative URLs. Invalid entry must not change Draft Mode state, echo secrets, or redirect. The valid redirect path must be rebuilt from validated route and slug values.

The draft indicator must render only when Draft Mode is enabled on Article or News detail requests, expose status semantics through a semantic `<output>` element, and exit through a POST form. Exit must disable Draft Mode and redirect to `/` with 303.

Article and News collection pages, Event and Home data, sitemap, robots, navigation, DTOs, mappers, page-switch dispatch, webhook tags, and published revalidation must preserve current behavior. There must be no content-type schema change, dependency addition, custom Strapi endpoint, extra cache, `generateStaticParams`, static export, or build-time CMS dependency.

`README.md` must state Preview is available only after the implementation is working and document `PREVIEW_CLIENT_URL`, matching `PREVIEW_SECRET`, and least-privilege `CMS_API_TOKEN`. Root `AGENTS.md` must retain the proactive-but-selective Preview rule and explicit content-type confirmation gate.

`mise run be:openapi` and `mise run fe:openapi` must complete and produce no unexplained semantic API changes. `mise run be:build`, `npm --prefix frontend test`, `mise run fe:check`, `mise run fe:build`, and `git diff --check` must all exit zero. Strapi must start from a new empty SQLite database. No backend tests are permitted or required.

## Idempotence and Recovery

All source and documentation edits are safe to reapply with scoped patches. Before touching a file, inspect its current diff and preserve unrelated hunks. Never use `git reset --hard`, `git checkout --`, or history rewriting. The local branch's ahead commit is user-owned state.

Backend Preview configuration is read-only with respect to content schemas and production data. Missing or invalid `PREVIEW_CLIENT_URL` or `PREVIEW_SECRET` should fail configuration clearly instead of silently exposing partial behavior. Correct only project-local ignored env files and restart. Do not add defaults for secrets or weaken anonymous permissions.

If Strapi returns no Preview URL, check the UID, selected status, document ID, populated `identity`, and non-empty slug. A missing published state should remain unavailable; do not fall back to draft or vice versa. If Next returns 401 for a valid admin-generated URL, verify matching local secrets and the encoded relative path without logging the secret. If a draft detail returns 404, inspect `status=draft` serialization and API-token permission; never fall back to published content.

If generated OpenAPI files change, inspect the exact diff. A real content/API difference contradicts this plan and requires stopping for a decision. Do not discard generated changes with a destructive Git command. Restore only generator-owned non-semantic churn with a scoped patch after confirming it does not overlap user work.

The runtime check uses only `backend/.tmp/preview-validation.db`. Stop Strapi, resolve and confirm that exact task-owned path, then remove only that file. Restore ignored local env files byte-for-byte without printing them. Never run acceptance against the user's normal database unless explicitly authorized.

If implementation discovers a required content-type change, stop. Obtain explicit user confirmation, apply the approved change through Strapi's API or admin UI rather than directly editing schema JSON, run `mise run be:types`, `mise run be:openapi`, and `mise run fe:openapi`, and revise all affected sections of this plan before continuing.

## Artifacts and Notes

Planning baseline:

    branch: main, one local commit ahead of origin/main
    worktree: clean
    backend: Strapi 5.52.0
    frontend: Next 16.3.1, React 19.2.8, Vitest 3.2.7
    frontend tests: 4 files passed, 14 tests passed
    frontend check: Biome, Next type generation, and TypeScript passed

Canonical tasks currently defined by `mise tasks`:

    be:build
    be:openapi
    be:types
    fe:build
    fe:check
    fe:format
    fe:lint
    fe:openapi
    fe:typecheck

The authoritative installed Next.js documents read for this plan are:

    frontend/node_modules/next/dist/docs/01-app/02-guides/draft-mode.md
    frontend/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/draft-mode.md
    frontend/node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md
    frontend/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
    frontend/node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md

The installed Strapi 5.52 sources used to resolve current public-documentation ambiguity are:

    backend/node_modules/@strapi/types/dist/core/config/admin.d.ts
    backend/node_modules/@strapi/content-manager/dist/server/preview/controllers/validation/preview.js
    backend/node_modules/@strapi/content-manager/dist/server/preview/controllers/preview.js
    backend/node_modules/@strapi/content-manager/dist/server/preview/services/preview-config.js
    backend/node_modules/@strapi/content-manager/dist/server/preview/services/preview.js

Stable URL contracts after implementation:

    Strapi admin -> GET /preview?url=%2Farticles%2F<encoded-slug>&secret=<secret>&status=draft
    Strapi admin -> GET /preview?url=%2Fnews%2F<encoded-slug>&secret=<secret>&status=published
    Draft indicator -> POST /preview -> 303 /

Do not include actual secrets in this plan, source control, test names, error responses, logs, screenshots, or generated evidence.

## Interfaces and Dependencies

Use only installed Strapi, Next.js, `openapi-fetch`, Node standard-library crypto and URL APIs, and Vitest. Add no package and do not change package manifests.

In `backend/config/admin.ts`, retain `Core.Config.Admin` and add the installed native Preview contract. The effective handler is:

    handler(
      uid: string,
      params: {
        documentId: string;
        locale?: string;
        status?: string;
      },
    ): Promise<string | null>

It returns a Next Preview URL only for `api::article.article` and `api::news-item.news-item`. `allowedOrigins` is a `string[]` containing only `PREVIEW_CLIENT_URL`'s origin.

In `frontend/config.ts`, `AppConfig` adds:

    previewSecret: string;

In `frontend/cms/secret.ts`, define:

    export function timingSafeCompareSecret(
      actual: string | null,
      expected: string,
    ): boolean;

In `frontend/cms/preview.ts`, define:

    export type ContentStatus = "draft" | "published";

    export interface PreviewRequest {
      pathname: string;
      status: ContentStatus;
    }

    export function parsePreviewRequest(
      requestUrl: string,
      expectedSecret: string,
    ): PreviewRequest | null;

In `frontend/cms/client.ts`, Article and News detail methods become:

    getArticleBySlug(
      slug: string,
      status: ContentStatus,
    ): Promise<Result<ArticleData>>;

    getNewsBySlug(
      slug: string,
      status: ContentStatus,
    ): Promise<Result<NewsData>>;

`frontend/cms/connector.ts` exposes the same status arguments with DTO result types. Public route callers remain `frontend/cms/data.ts`; routes do not call the raw client or connector directly.

`frontend/app/preview/route.ts` exports native App Router handlers:

    export async function GET(request: Request): Promise<Response>;
    export async function POST(request: Request): Promise<Response>;

`frontend/components/shared/preview-banner.tsx` exports one async `PreviewBanner` Server Component with no props. Article and News detail routes render it without changing `PageSwitch`.

Revision note: 2026-08-30 / Planner — Created this implementation ExecPlan after current-worktree inspection, complete planning-contract review, Context7 research, installed Next.js 16.3.1 documentation review, installed Strapi 5.52.0 Preview type/source review, CMS pipeline and caller tracing, canonical-task discovery, and green frontend baseline validation. The plan resolves status propagation, secret and open-redirect handling, cache isolation, editor exit behavior, generated-artifact expectations, empty-database validation, documentation truthfulness, and the already-satisfied AGENTS update without authorizing schema changes.

Revision note: 2026-08-31 / Worker — Implemented the approved scope; retained zero generated API artifact diff after generator-only churn; recorded passing focused/full tests, canonical builds, task-owned empty-database startup, and native HTTP Draft Mode entry/exit evidence. The browser-mediated Content Manager scenario remains an optional unexecuted observation because no browser controller exists in this environment; it is not a blocking validation gate.

Revision note: 2026-08-31 / Worker — Remediated Preview exit to return relative `Location: /` with status 303 and corrected the least-privilege `CMS_API_TOKEN` wording to cover all served CMS reads, including draft Article and News. Recorded the mismatched-Host runtime proof and reran required validation.

Revision note: 2026-08-31 / Coordinator — Recorded independent `APPROVED` / `REVIEW_READY` evidence after one remediation cycle, closed review-related progress, and finalized the outcome without changing implementation scope or validation claims.
