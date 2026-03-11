# Query Key Stability and Reactive Parameters

## Why it matters

`useSanityQuery` uses `useAsyncData` internally and derives a cache key from
a hash of the query string and params. If the cache key is unstable — for example,
because params is a new object literal on every render — data becomes stale or
re-fetches constantly. If reactive params are passed incorrectly, queries do not
re-run when dependencies change.

---

## How cache keys are derived

By default, the key is computed from the GROQ query string + serialized params.
This works reliably only when params is a stable reference (a `computed` or `ref`).

An inline object literal creates a new reference on each render cycle, producing
an unpredictable key and causing cache misses.

---

## Reactive params — correct pattern

```vue
<script setup lang="ts">
const route = useRoute()

// ✅ computed ref — stable reference, re-runs query when slug changes
const params = computed(() => ({ slug: route.params.slug as string }))
const { data: post } = await useSanityQuery<Post>(query, params)
</script>
```

---

## Reactive params — incorrect pattern

```vue
<script setup lang="ts">
const route = useRoute()

// ❌ Inline object — new reference every render, key mismatch, possible stale data
const { data: post } = await useSanityQuery<Post>(query, { slug: route.params.slug })
</script>
```

---

## Explicit cache key

Override the auto-generated key when you need predictable cache invalidation:

```ts
const { data, refresh } = await useSanityQuery<Post>(query, params, {
  key: `post-${route.params.slug}`,
})
```

---

## Server-side cache key normalisation (`buildSanityCacheKey`)

When building server-side cache keys for handlers with composite or variable param sets, object
key insertion order can vary between callers, causing `JSON.stringify` to produce different strings
for semantically identical params. Use a deep-sorting helper to prevent these phantom cache misses:

```ts
// utils/sanity-cache.ts
function sortKeysDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.keys(obj as object)
        .sort()
        .map((k) => [k, sortKeysDeep((obj as Record<string, unknown>)[k])])
    )
  }
  return obj
}

export function buildSanityCacheKey(scope: string, params: Record<string, unknown>): string {
  return `${scope}:${JSON.stringify(sortKeysDeep(params))}`
}
```

Use `buildSanityCacheKey` in the `getKey` callback of `defineCachedEventHandler` when the param
shape is variable or comes from multiple call sites.

---

## `stega: false` on server-side fetches

> **Note:** All server-side `sanity.fetch()` calls must pass `{ stega: false }` as the third
> argument:
>
> ```ts
> return sanity.fetch(query, params, { stega: false })
> ```
>
> Sanity's stega encoding injects invisible metadata into string fields to power Visual Editing
> overlays. If this leaks into a cached API response it will be served to regular visitors who
> have no Visual Editing context. See `features-visual-editing.md` for the full stega explanation.

---

## useSanityQuery vs useLazySanityQuery for performance

| | `useSanityQuery` | `useLazySanityQuery` |
|---|---|---|
| SSR | Yes — data included in page payload | No — fetched client-side after mount |
| Navigation blocking | Yes | No |
| Best for | Above-fold critical data | Below-fold, secondary data |
| SEO | ✅ Content in initial HTML | ❌ Content not in initial HTML |

---

## Cache invalidation

Manual refresh after a mutation or webhook:

```ts
// Refresh a specific query
const { data, refresh } = await useSanityQuery<Post[]>(query)
await refresh()

// Clear by key (from another composable or route handler)
clearNuxtData('post-hello-world')
```

---

## Avoiding stale CDN data

Sanity CDN caches responses for ~60 seconds. Options:

1. Set `useCdn: false` in `sanity` config for always-fresh data (higher latency)
2. Use `useCdn: true` and call `refresh()` after known content updates
3. Use Sanity webhooks to trigger `clearNuxtData` on the server

---

## Docs

- useSanityQuery options: https://sanity.nuxtjs.org/composables/use-sanity-query
- Nuxt useAsyncData: https://nuxt.com/docs/api/composables/use-async-data
- clearNuxtData: https://nuxt.com/docs/api/utils/clear-nuxt-data
