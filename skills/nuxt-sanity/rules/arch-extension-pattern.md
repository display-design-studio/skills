# Adding a New Sanity Document Type — 4-Step Recipe

> This recipe applies to the Display Nuxt Starter architecture. For the directory layout and
> data-flow overview see `arch-starter-pattern.md`. For caching details see `perf-cdn-caching.md`.

---

## Overview

Every new Sanity document type requires four files wired together in this order:

1. `shared/utils/<type>Query.ts` — GROQ query
2. `server/api/sanity/<type>.get.ts` — cached Nitro endpoint
3. `app/composables/useSanity<Type>.ts` — preview-switch composable
4. `app/pages/*.vue` — route page

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

The file is auto-imported — no import statement needed in server or composable files.

---

## Step 2 — Cached Nitro endpoint (`server/api/sanity/<type>.get.ts`)

Use `defineCachedEventHandler` to cache the Sanity response in Nitro storage and set a
`Cache-Control` header so Netlify CDN caches the response for 24 h with SWR.

```ts
// server/api/sanity/home.get.ts
import type { HomeQueryResult } from '#build/types/sanity-typegen'

export default defineCachedEventHandler(
  async (event) => {
    const { lang = 'en' } = getQuery<{ lang?: string }>(event)

    setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=86400, stale-while-revalidate=86400')

    const sanity = useSanity()
    return sanity.fetch<HomeQueryResult>(homeQuery, { lang })
  },
  {
    maxAge: 60 * 60 * 24, // 24 h Nitro cache
    getKey: (event) => {
      const { lang = 'en' } = getQuery<{ lang?: string }>(event)
      return `home:${lang}`
    },
  }
)
```

Cache key pattern: `<type>:<lang>` (or `<type>:<lang>:<slug>` for slug-parameterised types).

---

## Step 3 — Preview-switch composable (`app/composables/useSanity<Type>.ts`)

```ts
// app/composables/useSanityHome.ts
import type { HomeQueryResult } from '#build/types/sanity-typegen'

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
surgical CDN cache invalidation.

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
export default defineCachedEventHandler(
  async (event) => {
    const { lang = 'en', slug = '' } = getQuery<{ lang?: string; slug?: string }>(event)

    setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=86400, stale-while-revalidate=86400')

    const sanity = useSanity()
    return sanity.fetch<PageQueryResult>(pageQuery, { lang, slug })
  },
  {
    maxAge: 60 * 60 * 24,
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
