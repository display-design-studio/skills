# useSanityQuery and useSanity Composables

## Why it matters

`useSanityQuery` wraps `useAsyncData` — misusing it leads to double-fetching, stale cache,
and hydration errors on the client. `useSanity()` is the raw client; using it directly in
`<script setup>` without `useAsyncData` breaks SSR and fetches twice.

---

## useSanityQuery — standard data fetching

```vue
<script setup lang="ts">
const query = `*[_type == "post" && slug.current == $slug][0]`
const params = computed(() => ({ slug: route.params.slug }))

const { data: post, status, error, refresh } = await useSanityQuery(query, params)
</script>
```

- Runs on server and hydrates on client (SSR-safe)
- Returns `{ data, status, error, refresh }`
- `data` is a `Ref<T | null>` — always check for null before rendering

---

## Type safety with defineQuery

When using `@sanity/nuxt` typegen, wrap queries with `defineQuery` for automatic type inference:

```ts
import { defineQuery } from 'groq'

const postQuery = defineQuery(`*[_type == "post"][0]{ _id, title, body }`)
const { data } = await useSanityQuery(postQuery)
// data is typed automatically from GROQ result shape
```

→ For typegen setup, see `sanity-best-practices/rules/typegen-workflow.md`

When not using typegen, pass a generic:

```ts
const { data } = await useSanityQuery<Post>(query, params)
```

---

## useLazySanityQuery — non-blocking navigation

Use when the data is below the fold or you prefer the page to render immediately
with a loading state rather than blocking navigation:

```vue
<script setup lang="ts">
const { data: posts, status } = useLazySanityQuery(query)
// no await — navigation is not blocked
</script>

<template>
  <div v-if="status === 'pending'">Loading…</div>
  <PostList v-else :posts="posts" />
</template>
```

| | `useSanityQuery` | `useLazySanityQuery` |
|---|---|---|
| Blocks navigation | Yes (awaited) | No |
| SSR data | Included in payload | Fetched client-side |
| When to use | Critical above-fold data | Non-critical / below-fold |

---

## useSanity() — raw client access

Use only for:
- Live preview subscriptions
- One-off mutations (not possible via composable)
- Accessing named clients (`useSanity('preview')`)

```ts
// Subscription example (client-side only)
const client = useSanity()
onMounted(() => {
  const sub = client.client.listen(query, params).subscribe((update) => {
    // handle real-time update
  })
  onUnmounted(() => sub.unsubscribe())
})
```

---

## Preview-switch composable pattern

Use this pattern when you need a composable that serves a cached Nitro endpoint in production but
bypasses the cache and fetches live draft data in preview mode.

**When to use**: any page-level composable in the Display Nuxt Starter that should benefit from
CDN caching in production and show live draft data with stega overlays in preview.

`useSanityVisualEditingState()` returns the current visual editing state. The `enabled` flag may
be `undefined` before hydration, so coerce with `Boolean()`:

```ts
const visualEditingState = useSanityVisualEditingState()
const isPreview = computed(() => Boolean(visualEditingState?.enabled))
```

Full pattern:

```ts
// app/composables/useSanityHome.ts
import type { HomeQueryResult } from '#build/types/sanity-typegen'

export const useSanityHome = (params: { lang: string }) => {
  const visualEditingState = useSanityVisualEditingState()
  const isPreview = computed(() => Boolean(visualEditingState?.enabled))

  if (isPreview.value) {
    // Preview path: useSanityQuery → live draft data, stega-encoded for overlay clicks
    return useSanityQuery<HomeQueryResult>(homeQuery, params)
  }

  // Production path: useFetch → cached Nitro endpoint → CDN-backed response, stega disabled
  return useFetch<HomeQueryResult>('/api/sanity/home', { query: params })
}
```

- **Production path**: `useFetch` hits the cached Nitro endpoint which serves CDN-backed data with
  stega disabled — safe for public caching
- **Preview path**: `useSanityQuery` goes directly to Sanity with stega encoding active so the
  visual editing overlay knows which fields to annotate

→ See `arch-extension-pattern.md` for the full 4-step recipe that uses this pattern.

---

## Incorrect

```vue
<script setup lang="ts">
// ❌ useSanity().fetch() in setup — fetches twice (server + client), no cache
const client = useSanity()
const post = await client.fetch(query, params)
</script>
```

## Correct

```vue
<script setup lang="ts">
// ✅ useSanityQuery — SSR-safe, cached, deduped
const { data: post } = await useSanityQuery<Post>(query, params)
</script>
```

---

## Docs

- useSanityQuery: https://sanity.nuxtjs.org/composables/use-sanity-query
- useSanity: https://sanity.nuxtjs.org/composables/use-sanity
- Nuxt useAsyncData: https://nuxt.com/docs/api/composables/use-async-data
