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
