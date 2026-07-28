# Adding a New Sanity Document Type — 6-Step Recipe

> This recipe applies to the Display Nuxt Starter architecture. For the directory layout and
> data-flow overview see `arch-starter-pattern.md`. For caching details see `perf-cdn-caching.md`.
>
> **Workflow companion:** For the step-by-step checklist when adding a route in an existing
> project see `add-route.md` (or equivalent workflow skill).

---

## Overview

Every new Sanity document type requires six steps wired together in this order:

1. `shared/utils/<type>Query.ts` — GROQ query
2. `server/api/sanity/<type>.get.ts` — cached Nitro endpoint
3. `app/composables/useSanity<Type>.ts` — preview-switch composable
4. `app/pages/*.vue` — route page
5. `server/api/cache/revalidate.ts` — register the type's cache key(s) for webhook invalidation
6. Architecture documentation — update the route table

Step 5 is the one most likely to be skipped — skipping it doesn't cause an error, it just means
the new type's cache silently never gets invalidated by the webhook.

---

## Step 1 — GROQ query (`shared/utils/<type>Query.ts`)

Export the query with `defineQuery`. Always include `$lang`; add `$slug` for slug-parameterised types.

```ts
// shared/utils/homeQuery.ts
import { defineQuery } from 'groq'

export const homeQuery = defineQuery(`
  *[_type == "home" && language == $lang][0] {
    _id,
    title,
    description,
    // ...other fields
  }
`)
```

`defineQuery` itself must still be imported from `'groq'` as shown above. The query file lives in
`shared/utils/`, so its export (`homeQuery`) is available to both server and composable files
without a relative import path — but `defineQuery` is not auto-imported.

---

## Step 2 — Cached Nitro endpoint (`server/api/sanity/<type>.get.ts`)

Use `defineCachedEventHandler` to cache the Sanity response in Nitro storage and set a
`Cache-Control` header so Netlify CDN caches the response for 24 h with SWR.

```ts
// server/api/sanity/home.get.ts
import type { HomeQueryResult } from '#sanity-types'

const browserMaxAge = 3600   // browser-fresh window (1 hour)
const cdnMaxAge = 86400      // CDN + SWR (24 hours)

/**
 * GET /api/sanity/home
 *
 * Returns home page data from Sanity CMS.
 * Served from Nitro in-memory cache; CDN adds s-maxage=86400.
 *
 * @query lang - BCP-47 locale code (default: 'en')
 * @throws 400 if required params are missing
 * @cache max-age=3600 (browser), s-maxage=86400 (CDN)
 */
export default defineCachedEventHandler(
  async (event) => {
    const { lang = 'en' } = getQuery<{ lang?: string }>(event)

    setHeader(
      event,
      'Cache-Control',
      `public, max-age=${browserMaxAge}, s-maxage=${cdnMaxAge}, stale-while-revalidate=${cdnMaxAge}`
    )

    const sanity = useSanity()
    return sanity.fetch<HomeQueryResult>(homeQuery, { lang }, { stega: false })
  },
  {
    ...sanityCacheOpts,
    maxAge: cdnMaxAge,
    getKey: (event) => {
      const { lang = 'en' } = getQuery<{ lang?: string }>(event)
      return `home:${lang}`
    },
  }
)
```

Cache key pattern: `<type>:<lang>` (or `<type>:<lang>:<slug>` for slug-parameterised types).
Always pass `{ stega: false }` to `sanity.fetch()` — prevents stega encoding from leaking into
cached responses. `...sanityCacheOpts` (from `server/utils/sanityCache.ts`) pins the cache
storage key so the webhook handler can purge it later — see `core-server-routes.md` (Cached
Sanity endpoint conventions) for the full template and `perf-cdn-caching.md` for why this matters.

---

## Step 3 — Preview-switch composable (`app/composables/useSanity<Type>.ts`)

```ts
// app/composables/useSanityHome.ts
import type { HomeQueryResult } from '#sanity-types'

export const useSanityHome = (params: { lang: string }) => {
  const visualEditingState = useSanityVisualEditingState()
  const isPreview = computed(() => Boolean(visualEditingState?.enabled))

  if (isPreview.value) {
    // Preview: live draft data with stega encoding for overlay clicks
    return useSanityQuery<HomeQueryResult>(homeQuery, params)
  }

  // Production: cached Nitro endpoint → CDN-backed response, stega disabled
  return useFetch<HomeQueryResult>('/api/sanity/home', { query: params })
}
```

→ See `core-composables.md` (Preview-switch section) for the full pattern explanation.

---

## Step 4 — Route page (`app/pages/*.vue`)

Await the composable, null-guard before rendering, and tag the page with the document `_id` for
surgical CDN cache invalidation. `useCacheTag` ties the CDN page cache to the document `_id` so
the Sanity webhook can purge only the affected pages without clearing unrelated entries.

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
const { locale } = useI18n()
const { data } = await useSanityHome({ lang: locale.value })

if (data.value) {
  useCacheTag(data.value._id)
}
</script>

<template>
  <pre>{{ data }}</pre>
</template>
```

> **Placeholder pages**: `index.vue` and `[slug].vue` ship as `<pre>{{ data }}</pre>`. The
> data-fetching is fully wired — only the template needs to be replaced with real markup.

---

## Slug-parameterised variant (`page` type)

For document types with a slug, adjust the cache key and read `route.params.slug` in the page.

**Step 1** — add `$slug` to the query:

```ts
// shared/utils/pageQuery.ts
export const pageQuery = defineQuery(`
  *[_type == "page" && language == $lang && slug.current == $slug][0] {
    _id,
    title,
    // ...
  }
`)
```

**Step 2** — cache key includes slug:

```ts
// server/api/sanity/page.get.ts
const browserMaxAge = 3600
const cdnMaxAge = 86400

export default defineCachedEventHandler(
  async (event) => {
    const { lang = 'en', slug = '' } = getQuery<{ lang?: string; slug?: string }>(event)

    setHeader(
      event,
      'Cache-Control',
      `public, max-age=${browserMaxAge}, s-maxage=${cdnMaxAge}, stale-while-revalidate=${cdnMaxAge}`
    )

    const sanity = useSanity()
    return sanity.fetch<PageQueryResult>(pageQuery, { lang, slug }, { stega: false })
  },
  {
    ...sanityCacheOpts,
    maxAge: cdnMaxAge,
    getKey: (event) => {
      const { lang = 'en', slug = '' } = getQuery<{ lang?: string; slug?: string }>(event)
      return `page:${lang}:${slug}`
    },
  }
)
```

**Step 3** — composable passes slug:

```ts
// app/composables/useSanityPage.ts
export const useSanityPage = (params: { lang: string; slug: string }) => {
  const visualEditingState = useSanityVisualEditingState()
  const isPreview = computed(() => Boolean(visualEditingState?.enabled))

  if (isPreview.value) {
    return useSanityQuery<PageQueryResult>(pageQuery, params)
  }

  return useFetch<PageQueryResult>('/api/sanity/page', { query: params })
}
```

**Step 4** — page reads slug from route params:

```vue
<!-- app/pages/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const { data } = await useSanityPage({ lang: locale.value, slug: route.params.slug as string })

if (data.value) {
  useCacheTag(data.value._id)
}
</script>

<template>
  <pre>{{ data }}</pre>
</template>
```

---

## Step 5 — Register the new type's cache keys in the webhook handler

**This step is easy to skip and breaks cache invalidation silently if you do.** Add the new
type's cache key(s) to the `resolveNitroCacheKeys` switch in `server/api/cache/revalidate.ts`
(see `perf-cdn-caching.md`):

```ts
// server/api/cache/revalidate.ts
function resolveNitroCacheKeys(body: RevalidateBody): string[] {
  const { _type, slug } = body
  switch (_type) {
    case 'home':
      return SUPPORTED_LOCALES.map(lang => `home:${lang}`)
    case 'page':
      return slug ? SUPPORTED_LOCALES.map(lang => `page:${lang}:${slug}`) : []
    // + one case per new type, mirroring its getKey format from Step 2
    default:
      return []
  }
}
```

If the new type is slug-parameterised, also extend the Sanity webhook's GROQ projection (in the
Sanity manage dashboard, outside this repo) to include the slug field, e.g.
`{ _id, _type, "slug": slug.current }`. Without this step, the type's `defineCachedEventHandler`
endpoint keeps serving stale data for up to `cdnMaxAge` after every publish, even though the
webhook itself reports success.

## Step 6 — Update architecture documentation

After wiring the route, update the route table in your architecture documentation
(e.g. a `nuxt-sanity.md` or equivalent) with:

- The new endpoint path (`/api/sanity/<type>`)
- Query params (`lang`, `slug`, etc.)
- TTL values (`browserMaxAge` / `cdnMaxAge`)
- Cache key format (e.g. `<type>:lang:slug`)
- The `resolveNitroCacheKeys` entry added in Step 5

This keeps the architecture doc accurate as the API surface grows.
