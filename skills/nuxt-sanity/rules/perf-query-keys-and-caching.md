# Query Keys, Reactive Parameters, and Client Data

This rule covers Nuxt async-data state. HTTP/CDN caching and webhook invalidation are separate and
covered by `perf-cdn-caching.md`.

## How `useSanityQuery` keys data

`@nuxtjs/sanity@2.5` creates a Nuxt async-data key from a hash of the query plus the parameter values
present when the composable is called. It then watches reactive parameters and refreshes the query
when they change.

An inline object created once in `<script setup>` does not change identity on every Vue render. Its
real limitation is that a copied route or locale value is not reactive:

```ts
// Snapshot: does not update when Nuxt reuses the component for another slug
useSanityQuery(postQuery, { slug: route.params.slug })
```

Use reactive getters:

```ts
const params = reactive({
  get slug() {
    return route.params.slug as string
  },
  get lang() {
    return locale.value
  },
})

const { data } = await useSanityQuery<PostQueryResult>(postQuery, params)
```

The Display Starter accepts a computed object at its composable boundary and maps it into these
reactive getters before calling `useSanityQuery`.

## Explicit keys

Pass `key` only to control Nuxt async-data sharing or avoid a deliberate collision. Do not use it as
a substitute for reactive parameters.

```ts
const { data } = await useSanityQuery(postQuery, params, {
  key: `post-${locale.value}-${route.params.slug}`,
})
```

If the route can change without remounting, a fixed explicit key still relies on the reactive params
watcher for refresh. Keep the key deterministic and do not include secrets or high-cardinality
session values.

## Client refresh and clearing

`refresh()` refetches one composable instance. `refreshNuxtData(key)` and `clearNuxtData(key)` operate
on Nuxt client/server-render payload state for the current application process. They do not purge
Netlify, browser caches, or the Sanity API CDN.

```ts
const { refresh } = await useSanityQuery(postQuery, params)
await refresh()

clearNuxtData('post-about')
```

Never document a server webhook that calls `clearNuxtData()` as CDN invalidation. The Display Starter
webhook calls Netlify `purgeCache({ tags })`.

## Public versus preview fetches

- Public pages call `/api/sanity/*`; Netlify controls the HTTP response cache.
- Preview pages call `useSanityQuery`; the module controls perspective, stega, proxying, and live
  updates.
- Public server fetches pass `{ stega: false }`.
- Changing `useCdn` chooses Sanity's API CDN versus live API; it does not clear Nuxt or Netlify state.

Do not assign a fixed "Sanity CDN caches for N seconds" value. Sanity manages API-CDN freshness and
invalidation, can serve stale content during propagation or an outage, and does not expose a simple
application-controlled TTL.

## Lazy queries

`useLazySanityQuery` avoids blocking client navigation but can still execute during SSR. Use it for
non-critical data where a loading state is acceptable, not as a blanket SEO/client-only switch.

## Debug sequence

1. Log the resolved query parameters when the route or locale changes.
2. Confirm the parameter object is reactive and the query refreshes.
3. Check for an explicit key shared by unrelated queries.
4. Inspect the Nuxt payload separately from the `/api/sanity/*` response.
5. If the endpoint itself is stale, move to `perf-cdn-caching.md`; clearing Nuxt data cannot fix it.

## Docs

- Nuxt Sanity query composable: https://sanity.nuxtjs.org/composables/use-sanity-query
- Nuxt `useAsyncData`: https://nuxt.com/docs/api/composables/use-async-data
- Nuxt `clearNuxtData`: https://nuxt.com/docs/api/utils/clear-nuxt-data
