# Display Nuxt Starter — Architecture Overview

> This file documents the opinionated architecture of the Display Nuxt Starter. It builds on top of
> `@nuxtjs/sanity` and assumes the module is already configured. For the step-by-step recipe to add
> a new document type see `arch-extension-pattern.md`. For the caching layer see `perf-cdn-caching.md`.

---

## Directory layout

```
shared/utils/           GROQ queries — auto-imported, shared between server and client
server/api/sanity/      Cached Nitro endpoints (one per document type)
server/api/cache/       Cache invalidation endpoints (revalidate, purge)
server/middleware/      Preview bypass middleware
app/composables/        Preview-switch composables (useSanity<Type>)
app/pages/              Route pages — await composable, useCacheTag
i18n/locales/           Locale translation files
```

---

## Core data-flow

```
shared/utils/<type>Query.ts         GROQ query (defineQuery, exported)
  └─> server/api/sanity/<type>.get.ts   defineCachedEventHandler, cache key
        └─> app/composables/useSanity<Type>.ts   preview switch
              └─> app/pages/*.vue   await composable + useCacheTag(data._id)
```

- **Production path**: page → composable (`useFetch`) → cached Nitro endpoint → CDN-backed response
- **Preview path**: page → composable (`useSanityQuery`) → live Sanity draft data with stega encoding

---

## GROQ query conventions

- Files live in `shared/utils/` and are shared between server and client via Nuxt's `shared/` auto-import layer
- Export name matches filename: `shared/utils/homeQuery.ts` exports `homeQuery`
- Still import `defineQuery` explicitly from `'groq'` in each query file — it is not itself auto-imported
- Always declare `$lang` (and `$slug` for slug-parameterised types) as GROQ parameters:

```ts
// shared/utils/homeQuery.ts
import { defineQuery } from 'groq'

export const homeQuery = defineQuery(`
  *[_type == "home" && language == $lang][0] {
    _id,
    title,
    // ...fields
  }
`)
```

- Use `defineQuery` for automatic TypeScript typegen inference (see typegen note below)

---

## i18n conventions

| Convention | Value |
|------------|-------|
| Strategy | `prefix_except_default` |
| Default locale | `en` (no URL prefix) |
| Query param name | `lang` |
| GROQ param name | `$lang` |
| Locale files | `i18n/locales/<lang>.json` |

Pages pass `lang` as a query param to the Nitro endpoint; the endpoint reads it via `getQuery(event)` and forwards it to the GROQ query as `$lang`. See `features-sitemap-i18n.md` for sitemap handling with `prefix_except_default`.

---

## TypeScript typegen

`@nuxtjs/sanity` ships its own native typegen (`sanity.typegen` in `nuxt.config.ts`), which writes
types to the virtual path `#build/types/sanity-typegen`. **This starter does not use that
mechanism.** Instead it uses the Sanity CLI's typegen, run inside a separate `studio/` project
(cloned alongside this repo per `STARTER.md`), which writes to `studio/types/sanity.types.ts` and
is exposed to the app via the `#sanity-types` alias configured in `nuxt.config.ts`:

```ts
import type { HomeQueryResult } from '#sanity-types'
```

Before these types exist, `studio/` must be cloned/initialized and its typegen script run (see
`STARTER.md`) — until then, imports from `#sanity-types` will fail to resolve. When using
`defineQuery`, the result type is still inferred automatically from the query shape once the CLI
typegen output is present.

→ If you're building against a project that instead uses the module's native typegen (no
separate `studio/`), import from `#build/types/sanity-typegen` instead and skip the CLI step.

---

## Cross-references

- **Adding a new document type** → `arch-extension-pattern.md`
- **Caching layer, preview bypass, CDN invalidation** → `perf-cdn-caching.md`
- **Preview-switch composable pattern** → `core-composables.md` (Preview-switch section)
