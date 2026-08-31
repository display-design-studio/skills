# `useSanityQuery` and `useSanity` Composables

## Standard SSR data fetching

`useSanityQuery` wraps Nuxt's `useAsyncData`, participates in SSR, transfers its result in the Nuxt
payload, and watches reactive parameters.

```vue
<script setup lang="ts">
const route = useRoute()
const params = reactive({
  get slug() {
    return route.params.slug as string
  },
})

const { data: post, status, error, refresh }
  = await useSanityQuery<PostQueryResult>(postQuery, params)
</script>
```

`data` is nullable. Handle both `error.value` and a valid null result before rendering or tagging a
page response.

## Reactive parameters and query keys

`useSanityQuery` hashes the query and the parameter values once when creating its async-data key,
then watches reactive parameters for refreshes. An inline object in `<script setup>` is not recreated
on every Vue render, but it is non-reactive and will not update after route or locale changes.

Use a stable `reactive` object with getters for the module composable. A `computed` parameter object
is suitable at the page boundary and for `useFetch`, but the Display Starter converts it to reactive
getters before passing it to `useSanityQuery`.

Use an explicit `key` only when separate calls intentionally share Nuxt async data. The key itself is
not a server/CDN invalidation mechanism.

## Type safety

Wrap exported queries with `defineQuery`. With module typegen enabled, generated result types follow
the query variable name. The Display Starter instead imports Sanity CLI output through
`#sanity-types`.

```ts
import type { PostQueryResult } from '#sanity-types'

const { data } = await useSanityQuery<PostQueryResult>(postQuery, params)
```

See `arch-starter-pattern.md` for the starter's typegen choice.

## Lazy queries

`useLazySanityQuery` sets Nuxt async data to lazy mode. It does not block client-side navigation, but
it can still run during SSR and contribute payload data. Render a loading state because `data` may be
null while navigation continues.

```vue
<script setup lang="ts">
const { data: related, status } = useLazySanityQuery(relatedQuery, params)
</script>

<template>
  <RelatedSkeleton v-if="status === 'pending'" />
  <RelatedList v-else :items="related || []" />
</template>
```

## Raw client access

Use `useSanity()` for server routes, named clients, listeners, mutations, or client methods not
wrapped by `useSanityQuery`. In component setup, wrap raw fetches in `useAsyncData` to avoid repeating
them during client hydration.

```ts
const sanity = useSanity()
const { data } = await useAsyncData('articles', () => sanity.fetch(articlesQuery))
```

Prefer the Live Content API for scalable public live updates. Use `client.listen()` only when the
application needs mutation-level events.

## Display Starter preview switch

The public branch calls a server route backed by Netlify and Sanity CDN caching. The preview branch
uses `useSanityQuery` so Presentation receives draft data, stega metadata, and live updates.

```ts
import type { MaybeRef } from 'vue'
import type { PageQueryResult } from '#sanity-types'
import { reactive, toValue } from 'vue'

export function useSanityPage(params: MaybeRef<Required<SanityQueryParams>>) {
  const visualEditingState = useSanityVisualEditingState()
  const previewParams = reactive({
    get lang() {
      return toValue(params).lang
    },
    get slug() {
      return toValue(params).slug
    },
  })

  if (Boolean(visualEditingState?.enabled))
    return useSanityQuery<PageQueryResult>(pageQuery, previewParams)

  return useFetch<PageQueryResult>('/api/sanity/page', {
    query: () => toValue(params),
  })
}
```

Return the complete async-data object from both branches so pages receive consistent `data`, `error`,
`status`, and `refresh` properties. Preview state is established during SSR by the module's validated
preview cookie; do not switch branches based on an arbitrary client cookie.

## Docs

- `useSanityQuery`: https://sanity.nuxtjs.org/composables/use-sanity-query
- `useSanity`: https://sanity.nuxtjs.org/composables/use-sanity
- Nuxt `useAsyncData`: https://nuxt.com/docs/api/composables/use-async-data
