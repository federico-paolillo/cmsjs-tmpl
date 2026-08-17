# Template Architecture Review Handoff

## Review objective

Review the repository and verify that it implements the agreed **Strapi 5 + Next.js 16** architecture without accidental coupling, unsafe schema evolution, incorrect routing, or broken cache/type contracts.

Repository layout:

```text
backend/     # Strapi 5
frontend/    # Next.js 16
```

Return:

1. `PASS`, `PARTIAL`, or `FAIL` for each section.
2. File paths and concrete evidence.
3. Deviations and defects.
4. Risk level: `critical`, `high`, `medium`, or `low`.
5. Minimal corrective actions.

Do not accept README claims as evidence when code/configuration can be inspected.

---

## 1. Expected content model

Current intended Strapi structure:

```text
Single Types
  Home Page

Collection Types
  Articles
  News
  Events
```

Additional Content Types and Components are allowed when justified by the implementation.

### Verify

- `Home Page` is a Single Type.
- `Articles`, `News`, and `Events` are Collection Types.
- Content structure is represented by committed Strapi schema files.
- Reusable embedded structures use Strapi Components where appropriate.
- Dynamic Zones are used only where editor-controlled ordered heterogeneous content is required.

### Mental model

- **Content Type:** independently addressable Strapi document.
- **Single Type:** exactly one document.
- **Collection Type:** multiple documents.
- **Component:** reusable embedded structured value.
- **Dynamic Zone:** ordered heterogeneous list of allowed Components.

---

## 2. Authoritative Strapi schema

Expected authoritative files:

```text
backend/src/api/*/content-types/*/schema.json
backend/src/components/**/*.json
backend/database/migrations/*
backend/config/*
```

### Verify

- Schema/model JSON is committed.
- Database state is not treated as the source of truth.
- Schema changes are represented as source-control diffs.
- Generated Strapi TypeScript types are treated as derived artifacts.
- Historical data transformations live in committed migration files.

### Fail if

- Required schema exists only in a developer database.
- Content structure depends on manually reproducing Admin UI changes.
- Generated artifacts replace missing source schemas.

---

## 3. Routing model

The frontend must not pretend Strapi exposes a generic “fetch any document type by slug” API.

Expected routes:

```text
/                    -> Strapi Home Page Single Type
/articles/[slug]     -> Strapi Articles Collection Type
/news/[slug]         -> Strapi News Collection Type
/events/[slug]       -> Strapi Events Collection Type
```

Equivalent public route names are acceptable if intentionally chosen.

### Verify

- Each Collection Type has a concrete Next.js route entrypoint.
- Each route calls the corresponding Strapi API.
- Slug lookup is scoped to the correct Collection Type.
- There is no arbitrary URL-derived Strapi API path.
- Routes do not attempt to discover a document’s Content Type globally by slug.

### Fail if

Code effectively does:

```ts
fetch(`${STRAPI_URL}/api/${userControlledContentType}`)
```

without a bounded static mapping.

---

## 4. Route implementation should stay thin

Expected flow:

```text
Next route
  -> fetch Content-Type-specific Strapi data
  -> map/validate response
  -> frontend DTO
  -> shared PageComponent
```

Example:

```text
/events/[slug]
  -> getEventBySlug()
  -> toEventDto()
  -> PageComponent
  -> EventPageComponent
```

### Verify

Route files mainly perform:

- parameter extraction;
- Content-Type-specific data lookup;
- `notFound()` behavior;
- metadata/loading integration where required;
- delegation to shared rendering.

Business/presentation logic should not be duplicated across route files.

---

## 5. Frontend page DTO union

The generic abstraction belongs in the **frontend DTO/rendering layer**, not in Strapi routing.

Expected shape:

```ts
type PageDto =
  | HomePageDto
  | ArticleDto
  | EventDto
  | NewsDto;
```

Each DTO uses a frontend-only discriminator:

```ts
pageType: "home-page"
pageType: "article"
pageType: "event"
pageType: "news"
```

### Verify

- `pageType` is a frontend DTO discriminator unless there is a demonstrated CMS requirement for storing it.
- The discriminator is assigned by the adapter that already knows which endpoint produced the data.
- `PageDto` is a discriminated union.
- `PageType` should preferably derive from the union:

```ts
type PageType = PageDto["pageType"];
```

- Adding a new page DTO should force renderer exhaustiveness checks.

### Flag

- redundant Strapi `pageType` fields that merely repeat the Content Type;
- independently maintained `PageType` unions that can drift from DTO definitions;
- use of `any` instead of a discriminated union.

---

## 6. Generic PageComponent

Expected central renderer:

```text
PageComponent
  -> HomePageComponent
  -> ArticlePageComponent
  -> NewsPageComponent
  -> EventPageComponent
```

Conceptually:

```ts
switch (page.pageType) {
  case "home-page":
  case "article":
  case "news":
  case "event":
}
```

### Verify

- dispatch is exhaustive;
- unknown variants fail explicitly;
- specialized page components receive specialized DTOs;
- shared rendering logic is reused below this layer rather than forcing unrelated page types into one giant structure.

Prefer compile-time exhaustiveness via `never`.

---

## 7. Specialized page components

Expected examples:

```text
HomePageComponent
ArticlePageComponent
NewsPageComponent
EventPageComponent
```

### Verify

Each component:

- receives only its specialized DTO;
- owns layout/presentation for that page type;
- composes reusable lower-level React components;
- does not directly query Strapi;
- does not depend on raw Strapi response shapes.

### Assess

Whether reuse is occurring at the correct level.

Good reuse:

```text
Summary
Identity
Hero
Blocks
ArticleCard
EventCard
NewsCard
```

Bad reuse:

- giant conditional JSX component containing all page-type-specific markup;
- forcing unrelated DTOs into one excessively optional interface.

---

## 8. Homepage behavior

`Home Page` is special because it is the site entrypoint and may aggregate content from other Collection Types.

Expected logical flow:

```text
/
  -> getHomePage()
  -> getLatestArticles()
  -> getLatestNews()
  -> getUpcomingEvents()
  -> assemble HomePage view
```

Only fetch lists that are actually required by the implementation/customer configuration.

### Verify

- persisted `HomePageDto` represents editorial homepage configuration;
- Article/News/Event lists may be fetched separately;
- aggregate query results are not falsely represented as fields that live in the Strapi Home Page document unless they actually do;
- empty collections are handled gracefully.

A separate view model is acceptable:

```ts
interface HomePageViewModel {
  page: HomePageDto;
  articles: ArticleCardDto[];
  news: NewsCardDto[];
  events: EventCardDto[];
}
```

---

## 9. Strapi API contract

Strapi REST endpoints are Content-Type-specific.

Expected examples:

```text
/api/home-page
/api/articles
/api/news
/api/events
```

Slug lookup for Collection Types should be implemented by filtering the corresponding endpoint.

### Verify

- data-access functions are Content-Type-specific;
- endpoint names are not leaked unnecessarily into presentation components;
- Strapi `documentId` is treated as stable only within the known Content Type context;
- code does not assume `documentId` can identify a document globally across Content Types.

---

## 10. OpenAPI contract generation

Expected pipeline:

```text
Strapi schema
  -> OpenAPI specification on disk
  -> openapi-typescript
  -> generated transport types
  -> frontend adapters
  -> frontend DTOs
```

### Verify

- OpenAPI generation is scripted from `backend/`.
- Output path is deterministic.
- generated TypeScript transport types are consumable by `frontend/`.
- generation is non-interactive.
- stale generated artifacts can be detected if committed.

### Important boundary

Generated OpenAPI types are **transport types**, not React component props/domain models.

### Flag

- presentation components importing giant generated API response types directly;
- raw OpenAPI response shapes spread throughout frontend code;
- generated transport schema treated as the only frontend model.

---

## 11. Frontend DTO / adapter boundary

Preferred flow:

```text
Strapi HTTP response
  -> generated transport type
  -> adapter
  -> explicit frontend DTO
  -> React component
```

Example:

```ts
type ImageDto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};
```

rather than propagating raw Strapi media objects.

### Verify

- adapters isolate Strapi-specific field names and metadata;
- DTOs contain only frontend-relevant data;
- React components remain Strapi-agnostic;
- media URLs and alternate text are normalized at the boundary;
- optional/null Strapi values are normalized intentionally.

### Prefer

Explicit DTOs over widespread:

```ts
Pick<GeneratedStrapiType, ...>
```

`Pick` is acceptable locally, but should not become the architecture.

---

## 12. Runtime validation

Generated TypeScript types do not validate network responses.

### Review

Determine whether runtime validation exists at the CMS boundary.

If present, verify:

```text
HTTP JSON
  -> unknown
  -> validation
  -> DTO
```

If absent, do not fail the architecture solely for that reason unless the repository explicitly requires untrusted/multi-version API validation.

Flag unsafe broad assertions such as:

```ts
const page = await response.json() as EventDto;
```

when no adapter/validation exists.

---

## 13. Strapi query/populate correctness

Relations, media, Components, and Dynamic Zones require explicit population.

### Verify for each rendered Content Type

- required scalar fields are requested;
- media fields are populated;
- relations are populated;
- nested Components are populated;
- Dynamic Zone component-specific population is correct.

### Preferred organization

Query/population configuration should live near the corresponding CMS adapter/data-access code.

### Fail if

A frontend field is expected to exist but the Strapi query never requests/populates it.

---

## 14. Presentation ownership

Next.js owns presentation.

Strapi should provide:

- text;
- media;
- relations;
- order;
- bounded editorial presentation choices.

Next.js should own:

- HTML/React structure;
- CSS/styling;
- responsive behavior;
- accessibility;
- component implementation.

### Flag

- arbitrary CSS stored in Strapi;
- arbitrary component import names coming from CMS data;
- editor-controlled HTML used as the general page-layout system;
- presentation components tightly coupled to Strapi implementation details.

---

## 15. Cache Components / ISR model

Expected default:

> Public CMS content is cached and revalidated. It should not require a Strapi request for every visitor request.

Next.js 16 Cache Components may use:

```text
use cache
cacheTag(...)
cacheLife(...)
```

### Verify

- cache boundaries are deliberate;
- public CMS requests are cached where appropriate;
- Content-Type-specific tags exist;
- request-specific or draft content is not placed in shared public cache.

Example tags:

```text
home-page
articles:all
article:<documentId>
news:all
news:<documentId>
events:all
event:<documentId>
```

Slug-based tags may also be used when useful.

---

## 16. Homepage cache dependencies

The homepage may depend on several datasets.

Example:

```text
home-page
articles:all
news:all
events:all
```

### Verify

Publishing an Article/News/Event invalidates any homepage cache that displays that collection.

Do not assume invalidating only:

```text
article:<documentId>
```

is sufficient if `/` contains a latest-articles list.

---

## 17. Revalidation webhook

Expected:

```text
Strapi content event
  -> authenticated Next.js Route Handler
  -> bounded event mapping
  -> revalidateTag / revalidatePath
```

### Verify

- webhook endpoint authenticates a secret/token header;
- publish is handled;
- unpublish is handled;
- delete is handled;
- create/update are handled where Draft & Publish does not gate visibility;
- event/model is mapped to known cache tags;
- homepage aggregate dependencies are invalidated where necessary.

### Critical fail

A public endpoint accepts arbitrary cache tags/paths and forwards them directly to Next revalidation APIs.

---

## 18. Draft preview

Expected capability if implemented:

```text
Strapi Preview
  -> protected Next.js Draft Mode entrypoint
  -> draft-aware Strapi fetch
  -> specialized renderer
```

### Verify

- preview endpoint is protected;
- redirects are validated;
- preview fetches unpublished content intentionally;
- draft content cannot enter public caches.

If preview is not implemented yet, mark it as an explicit gap, not an architectural failure unless the template claims to support it.

---

## 19. Shared loading / error / not-found behavior

Routes remain separate, but user-facing states should be reused where sensible.

Possible organization:

```text
frontend/app/(content)/
  loading.tsx
  ...
```

or shared components/utilities.

### Verify

- route-specific files are not copy-pasted unnecessarily;
- `notFound()` is used for missing slugs;
- shared loading/error UI is reused where appropriate;
- route groups do not accidentally change public URLs.

Do not require one specific filesystem organization if the behavior is correct.

---

## 20. Empty-CMS behavior

The template defines content structure, not seed content.

### Verify

- no editorial seed content is required;
- no `bootstrap()` seeding exists solely to create schemas;
- `/` handles a missing/unconfigured Home Page intentionally;
- missing Article/News/Event slugs return not-found behavior;
- empty homepage lists render safely;
- frontend build does not depend on existing editorial content.

If `bootstrap()` exists, verify it serves a non-seeding runtime purpose.

---

## 21. Schema migrations

Expected Strapi behavior:

- custom migrations are forward-only;
- migrations run before schema synchronization;
- schema synchronization still applies committed model changes.

### Verify

- migrations are committed under `backend/database/migrations/`;
- execution order is deterministic;
- migrations are compatible with the configured DB engine;
- fresh-install behavior is considered;
- persisted-data changes have upgrade tests.

### Field rename

Accept either:

#### Expand / migrate / contract

```text
add new field
-> apply schema
-> copy old data into new field
-> remove old field later
```

or a justified physical rename when:

- tested against the actual DB;
- rollback compatibility is not required;
- old/new application versions will not coexist against the schema.

### Flag

- destructive field removal without data preservation analysis;
- migration assuming historical tables/columns always exist on clean install;
- undocumented rollback assumptions.

---

## 22. CI verification

### A. Clean CMS initialization

Expected conceptual check:

```text
clean database
  -> start Strapi
  -> run migrations
  -> schema synchronization
  -> generate Strapi/OpenAPI/frontend transport types
  -> API smoke tests
```

Verify:

- schemas are valid;
- historical migrations do not break fresh initialization;
- generated artifacts are current.

### B. Generated contract drift

If generated files are committed:

```text
generate
git diff --exit-code
```

CI should fail on stale output.

### C. Upgrade test

Required when schema/migrations change.

Conceptually:

```text
base revision
  -> initialize DB
  -> create representative persisted data

candidate revision
  -> start against same DB
  -> migrations/schema sync
  -> assert transformed data
```

### D. Frontend integration

At minimum verify:

- `/` can render Home Page data;
- `/articles/[slug]` resolves Article only;
- `/news/[slug]` resolves News only;
- `/events/[slug]` resolves Event only;
- unknown slugs return not found;
- `PageComponent` dispatches all DTO variants;
- webhook authentication works;
- relevant cache tags are invalidated.

---

## 23. Review output format

Return:

```text
Overall: PASS | PARTIAL | FAIL

Routing/content model
- Status:
- Evidence:
- Deviations:
- Recommended fix:

Strapi schema
- Status:
- Evidence:
- Deviations:
- Recommended fix:

Frontend DTO contract
- Status:
- Evidence:
- Deviations:
- Recommended fix:

OpenAPI/type generation
- Status:
- Evidence:
- Deviations:
- Recommended fix:

Rendering
- Status:
- Evidence:
- Deviations:
- Recommended fix:

Caching/revalidation
- Status:
- Evidence:
- Deviations:
- Recommended fix:

Migrations/CI
- Status:
- Evidence:
- Deviations:
- Recommended fix:

Open questions
- ...
```

Prioritize architectural contract violations over naming/style preferences.

Do not recommend abstractions unless they solve a demonstrated problem or protect one of the contracts above.
