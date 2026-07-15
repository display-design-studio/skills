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

When using `@nuxtjs/sanity`'s built-in typegen (`sanity.typegen` in `nuxt.config.ts` — there is
no separate `@sanity/nuxt` package), wrap queries with `defineQuery` for automatic type inference: 

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
```

To reuse data that was already included in the SSR payload (avoiding a second network round-trip
for below-fold content), pass `getCachedData`:

```ts
const { data } = useLazySanityQuery(query, params, {
  key: `<scope>-${params.slug}`,
  getCachedData: (key) => useNuxtApp().payload.data[key] ?? null,
})
```

```vue

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

Full pattern (with `async`/`await` and explicit `isPreview` guard):

```ts
// app/composables/useSanity<Name>.ts
// This starter uses the Sanity CLI's typegen output via the `#sanity-types` alias —
// see arch-starter-pattern.md for why this differs from the module's native typegen.
import type { <Name>QueryResult } from '#sanity-types'

export const useSanity<Name> = async (params: { lang: string; slug?: string }) => {
  const visualEditingState = useSanityVisualEditingState()
  const isPreview = computed(() => Boolean(visualEditingState?.enabled))

  if (isPreview.value) {
    // Preview: live draft data, stega-encoded for Visual Editing overlays.
    // Preview-state handling (including which perspective is used) is driven by the module's
    // own preview composables — see useSanityPerspective()/useSanityPreviewPerspective() below —
    // rather than a value you need to compute or pass yourself.
    const { data } = await useSanityQuery<<Name>QueryResult>(<name>Query, params)
    return data
  }

  // Production: cached Nitro endpoint → CDN-backed response, stega disabled
  const { data } = await useFetch<<Name>QueryResult>('/api/sanity/<scope>', {
    query: params
  })
  return data
}
```

- **Production path**: `useFetch` hits the cached Nitro endpoint which serves CDN-backed data with
  stega disabled — safe for public caching
- **Preview path**: `useSanityQuery` goes directly to Sanity with stega encoding active so the
  visual editing overlay knows which fields to annotate. `@nuxtjs/sanity` exposes dedicated
  composables for inspecting/controlling the perspective instead of a single hidden auto-switch —
  use `useSanityPerspective()` to read the active perspective and `useSanityPreviewPerspective()` /
  `useIsSanityLivePreview()` when a composable needs to branch on preview state explicitly. Don't
  assume a bare `useSanityQuery` call always resolves to `previewDrafts` with no configuration —
  check these composables if a query isn't returning draft content as expected.

→ See `arch-extension-pattern.md` for the full 4-step recipe that uses this pattern.

**Visual editing mode**: `sanity.visualEditing.mode` defaults to `'live-visual-editing'`, which
streams live draft updates to the overlay automatically (no manual refresh wiring needed) — this
is the mode to use for the standard "Studio editor sees live changes, end user gets server-cached
content" workflow, and needs no extra composable beyond the preview-switch pattern above. Use
`'visual-editing'` for overlays without live streaming, or `'custom'` only if you're wiring the
client plugin yourself via `useSanityVisualEditing()` — in `'custom'` mode (or when you need to
check/react to live-mode state explicitly, e.g. for debugging), use `useSanityLiveMode()` to
inspect or drive the live connection. Note `sanity.minimal: true` (the query-only micro client)
is **incompatible** with `visualEditing` and `liveContent` — the module disables them if
`minimal` is set.

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
