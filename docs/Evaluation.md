# Template Architecture Evaluation

Review date: 2026-08-17  
Reviewed versions: Next.js 16.3.1, React 19.2.8, Strapi 5.52.0

## Overall: FAIL

The source shows the intended Strapi-to-DTO boundary, but the current frontend does not build and the only implemented dynamic route cannot fetch or render an event successfully. Missing ISR, the empty refresh endpoint, and other declared placeholders are recorded as incomplete work rather than treated as unexpected regressions. Empty Next.js convention files are still defects when their presence makes Next activate invalid route modules.

### Priority defects

1. **High:** Every slug-filtered CMS request fails before `fetch`. `cms/client.ts:271-275` passes a deeply nested `filters` object to the default `openapi-fetch` serializer. Version 0.17.0 explicitly rejects nested objects; a direct check produced `Deeply-nested arrays/objects aren't supported`. This affects Page, Event, and News slug lookups.
2. **High:** A successful event lookup still throws. `components/page-switch.tsx:9-14` handles only `"home-page"`; `app/(content)/events/[slug]/page.tsx:32-33` passes it an `EventDto`. `components/event-page.tsx` exists but is misnamed `HomePage` and is never used.
3. **High:** `npm run build` fails. `reactCompiler: true` is enabled without `babel-plugin-react-compiler`, and the empty `app/(content)/error.tsx` activates the error-file convention without being a Client Component. The empty `app/refresh/route.ts` also fails `tsc` because it is not a module. The empty loading and not-found convention files should likewise be removed until they have valid default exports.
4. **High:** The event cache function accepts and invokes a non-serializable `CmsConnector` argument (`app/(content)/events/[slug]/page.tsx:13-22`). Next.js 16 requires cached-function arguments to be serializable; non-serializable pass-through values cannot be called or inspected.
5. **High:** `populate: "*"` is insufficient for the nested media expected by the DTO mappers. `cms/client.ts` uses it for all content, while Home Page and Page place media inside Dynamic Zone components. Strapi 5 requires component-specific `populate[...][on][...]` configuration for nested relations/media. The mapper then requires `hero.visual` and will reject the under-populated response.

## Routing/content model

- **Status:** FAIL
- **Evidence:** `home-page` is a Single Type; `event` and `news` are Collection Types. Data access uses bounded, Content-Type-specific paths (`/home-page`, `/events`, `/newses`, `/pages`). The route group does not affect the public `/events/[slug]` URL. The event route is thin and uses `notFound()` for a missing result.
- **Deviations:** **High:** the required Article Collection Type and `/articles/[slug]` route do not exist; a generic `Page` Collection Type is present instead. **High:** `/news/[slug]` and a CMS-backed `/` are absent. **High:** the implemented slug query cannot be serialized. **Medium:** `identity` is optional in the Page, Event, and News schemas, so Strapi permits publishing documents that cannot be routed.
- **Recommended fix:** Decide whether `Page` intentionally replaces `Article`; either add Article and its route or revise the handoff contract. Make identity required for routed types. Configure a Strapi-compatible nested query serializer once at client creation and test one generated slug URL.

## Strapi schema

- **Status:** PARTIAL
- **Evidence:** Authoritative schemas exist under `backend/src/api/*/content-types/*/schema.json`; reusable `identity.slug`, `shared.hero`, and `shared.section` components exist under `backend/src/components`. `backend/src/index.ts` performs no bootstrap seeding. Home Page is correctly `singleType`; Event, News, and Page are `collectionType`.
- **Deviations:** **High:** no Article schema exists. **Medium:** both Dynamic Zones currently permit exactly one component type (`home-page.content` only `shared.hero`; `page.sections` only `shared.section`), so they provide no heterogeneous ordering capability. **Medium:** required nested media is not explicitly populated. **Low:** `backend/cmsjs-tmpl.db` is a developer database and is not covered by the backend `*.sqlite` ignores; it can be committed accidentally. The repository currently has zero commits and zero tracked files, so committed-source claims cannot pass.
- **Recommended fix:** Use repeatable components until a zone genuinely supports multiple component types. Add explicit per-component populate definitions near each data-access function. Ignore `*.db` or this exact database file before the initial commit.

## Frontend DTO contract

- **Status:** PARTIAL
- **Evidence:** `cms/model.ts:154-159` defines a discriminated `CmsPageDto` union. Endpoint-aware mappers assign frontend-only `pageType` values and manually validate network payload structure. React components depend on DTOs rather than generated Strapi types. The generated transport types remain confined to `cms/client.ts` and mapper signatures.
- **Deviations:** **Medium:** `PageSwitch` is neither complete nor compile-time exhaustive; its `default` branch hides new variants rather than assigning the remainder to `never`. **Medium:** Strapi media URLs are copied directly into DTOs (`cms/mappers.ts:190-246`) rather than normalized against the public CMS/media origin; local Strapi commonly returns relative `/uploads/...` paths. **Low:** `PageType` is independently maintained at `cms/model.ts:117` instead of deriving from `CmsPageDto["pageType"]`. **Low:** `toCmsPageDto` takes a union plus a separate discriminator and uses assertions even though endpoint-specific mappers already cover the real flow.
- **Recommended fix:** Implement every renderer and use a `never` exhaustiveness check. Normalize media URLs in the adapter. Derive `PageType` from the DTO union and remove the unused generic mapper unless a caller appears.

## OpenAPI/type generation

- **Status:** PARTIAL
- **Evidence:** `backend/package.json:16` generates `../cms-api.json`; `frontend/package.json:10` generates `frontend/cms/schema.d.ts`. Paths are deterministic and the frontend consumes the generated `paths` type through `openapi-fetch`. Regeneration produced semantically identical output after Biome formatting.
- **Deviations:** **Medium:** there is no CI drift check and no root command chaining Strapi OpenAPI generation, frontend type generation, formatting, and `git diff --exit-code`. **Low:** the frontend generation script alone changes formatting, so a naive drift check would fail even when the schema is current. **Low:** the generated contract includes many plugin/admin endpoints that the frontend does not use, increasing artifact size but not coupling presentation code.
- **Recommended fix:** Make the generation command format `cms/schema.d.ts`, then add one CI command that regenerates both artifacts and fails on a diff.

## Rendering

- **Status:** FAIL
- **Evidence:** Specialized Home and Event component files accept specialized DTOs, and the route delegates to the central switch. Server Components are used by default and Next.js 16's promised `params` API is handled correctly.
- **Deviations:** **High:** Event rendering is unreachable because the switch handles only Home Page. Home Page, Page/Article, News, Contact, Blocks, Dynamic Zones, and media rendering are absent or placeholders. **High:** current Next convention files break the build. **Medium:** `global-error.tsx` exports metadata from a Client Component, which Next.js does not support; it should use `<title>`. It also lacks `lang` and recovery via the stable `retry()` prop. **Medium:** non-not-found failures are thrown as plain objects rather than `Error` instances. **Low:** `event-page.tsx` exports an incorrectly named `HomePage`.
- **Recommended fix:** Delete empty convention files until implemented. Wire each DTO variant to its component, rename `EventPage`, and make the switch exhaustive. Implement error UI as a Client Component with retry; keep `global-error` self-contained with `<html lang>` and `<title>`.

## Caching/revalidation

- **Status:** FAIL
- **Evidence:** Cache Components and partial prefetching are enabled. The event lookup attempts an explicit `use cache` boundary with `cacheLife("days")` and collection/slug tags.
- **Deviations:** **High:** the connector cache argument violates Cache Components serialization rules. **High:** the empty refresh Route Handler provides no authentication, bounded event mapping, or invalidation. **Medium:** because transport failures are converted to `Result` values inside the cached function, transient network/HTTP failures can be cached as ordinary values for the cache lifetime. **Medium:** homepage aggregate dependency tags do not exist. Draft preview is absent, as expected at this stage.
- **Recommended fix:** Keep only serializable inputs such as `slug` at cache boundaries and resolve the server-only CMS client inside the cached data function. Cache successful/not-found content, not transient failures. When the API is ready, authenticate a fixed secret header and map known Strapi models/events to fixed tags; call `revalidateTag(tag, "max")` from the Route Handler. Do not accept arbitrary tags or paths from the request.

## Migrations/CI

- **Status:** FAIL
- **Evidence:** `backend/database/migrations/.gitkeep` reserves the standard migration directory. Backend TypeScript and `strapi build` pass. No migration is currently required because no historical data transformation is represented.
- **Deviations:** **High:** no CI configuration or frontend integration tests exist. **High:** frontend build, TypeScript, and Biome checks fail. **Medium:** the approximately 1,000-line runtime mapper/parser has no runnable check. **Low:** no migration upgrade harness exists; add it only with the first data-changing migration.
- **Recommended fix:** First make `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass. Add one focused mapper test plus route-level checks for the four required URLs, not-found behavior, renderer exhaustiveness, webhook authentication, and tag mapping. Add an upgrade test only when a migration is introduced.

## Next.js idiomacy

- **Status:** PARTIAL
- **Idiomatic:** App Router layout/page conventions, Server Components by default, asynchronous route params, `notFound()`, route groups, typed routes, Cache Components primitives, and colocated segment state files are the correct Next.js 16 mechanisms.
- **Non-idiomatic:** Empty convention files are not placeholders; filenames activate framework behavior. Passing a dependency-injection object through `use cache` conflicts with the cache serialization model. `global-error` cannot export Metadata. `instrumention.ts` is misspelled and therefore ignored; eagerly constructing a singleton is not a useful instrumentation hook. `NEXT_PUBLIC_CMS_URL` is server infrastructure but uses a browser-exposed prefix and is not narrowed/validated, causing a TypeScript error. `reactCompiler` is enabled without its required package and currently provides no demonstrated value.
- **Recommended fix:** Remove `reactCompiler` until it is deliberately adopted with the required package. Rename the CMS variable to `CMS_URL`, validate it once in a server-only module, and import `server-only` in the CMS composition root. Delete `instrumention.ts`; add correctly named `instrumentation.ts` only when implementing observability or `onRequestError`.

## Applicable Next.js features

1. **Per-segment loading and streaming:** Fill `app/(content)/loading.tsx` with a real shared skeleton after the data routes exist. On the aggregate homepage, start independent CMS requests together and place slow sections behind separate `<Suspense>` boundaries so the editorial shell streams before lists. Do not add Suspense around already synchronous/static fragments.
2. **Route error boundaries:** Implement `app/(content)/error.tsx` as a Client Component using the stable Next.js 16 `retry()` prop. Keep `global-error.tsx` only for root-layout failure. Connect server error reporting through `instrumentation.ts:onRequestError` when an error service is selected.
3. **Cache Components and on-demand revalidation:** This is the idiomatic Next.js 16 ISR-equivalent for the enabled configuration: `use cache` + `cacheLife` + `cacheTag`, with authenticated `revalidateTag(..., "max")`. There is no need to add legacy route-level `export const revalidate` beside it.
4. **Dynamic metadata:** Add `generateMetadata` to content routes using the same cached lookup for title, description, canonical URL, and Open Graph image. Missing content can call `notFound()` there as well.
5. **Draft Mode:** Add protected enable/disable Route Handlers when Strapi Preview is configured. Validate redirect targets, request draft content explicitly, and rely on Draft Mode bypassing shared cache writes.
6. **`next/image`:** The image DTO already has dimensions and alt text. Normalize URLs, configure a narrow `images.remotePatterns` entry for the media host, and render CMS images with `Image` to get sizing and optimization.
7. **`generateStaticParams`:** Optional after content exists. Pre-render known high-traffic slugs while allowing other pages to generate on demand. It is not required for ISR and should not make builds depend on a non-empty CMS.
8. **Metadata files:** Add `sitemap.ts`, `robots.ts`, and content-driven Open Graph images when public routes stabilize. These are more relevant than custom API endpoints for a public CMS site.
9. **`next/font` and `Link`:** Use `next/font` when typography is selected, and `next/link` for internal CMS links so typed routes and partial prefetching provide value.

## Features not currently justified

- Server Actions: no mutation workflow exists.
- Parallel/intercepting routes: no modal or independently navigable slot requirement exists.
- Middleware/proxy: no authentication, localization, or request rewrite requirement exists.
- Remote cache handlers: use the default cache first; add shared remote storage only when the deployment topology demonstrates that instance-local caching is insufficient.

## Open questions

- Is generic `Page` an intentional replacement for `Article`, or is Article still planned?
- Will Home Page and Page Dynamic Zones gain multiple component types? If not, repeatable components are the simpler schema.
- What deployment topology and media origin will be used? This determines whether the default Cache Components handler is sufficient and the exact `next/image` allowlist.
- Are CMS slug values intended to be unique per Content Type or globally? The data model and webhook tag scheme should enforce the chosen scope explicitly.

## Verification performed

- `frontend: npm run lint` - failed: 12 errors and 10 warnings.
- `frontend: npm run build` - failed: missing React Compiler package and invalid empty error convention file.
- `frontend: npx tsc --noEmit` - failed: empty refresh route is not a module; CMS URL remains `string | undefined`.
- `backend: npm run build` - passed.
- `backend: npx tsc --noEmit` - passed.
- OpenAPI TypeScript regeneration - matched the checked artifact after formatting.
- Installed Next.js 16.3.1 docs and current Context7 Next.js/Strapi documentation were used for framework-specific judgments.
