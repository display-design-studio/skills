# SEO Meta Tags from Sanity Data

## Why it matters

`@nuxtjs/seo` is installed in the Display Nuxt Starter and provides the `useSeoMeta()`
composable. However, pages render **without `<title>` or `<meta>` tags** unless `useSeoMeta()`
is called explicitly in each page component. The composable is auto-imported — no import
statement is required. A null-guard is mandatory before calling it, and the GROQ query must
expose the `seo` fields including a fully-resolved `ogImage` URL.

---

## Incorrect

```vue
<!-- pages/index.vue — no useSeoMeta() call -->
<script setup lang="ts">
const { data } = await useAsyncData('home', () => $fetch('/api/home'))
</script>

<template>
  <main>
    <h1>{{ data?.title }}</h1>
  </main>
</template>
<!-- ❌ No <title> or <meta> tags rendered — SEO invisible to crawlers -->
```

---

## Correct

### GROQ query — expose `seo` fields with resolved `ogImage` URL

```ts
// queries/home.ts
import { defineQuery } from 'groq'

export const homeQuery = defineQuery(`*[_type == "home"][0]{
  title,
  seo {
    title,
    description,
    "ogImageUrl": ogImage.asset->url
  }
}`)
```

### `pages/index.vue` — null-guard then `useSeoMeta()`

```vue
<script setup lang="ts">
const { data } = await useAsyncData('home', () => $fetch('/api/home'))

if (data.value) {
  useSeoMeta({
    title: data.value.seo?.title ?? data.value.title,
    description: data.value.seo?.description ?? undefined,
    ogTitle: data.value.seo?.title ?? data.value.title,
    ogDescription: data.value.seo?.description ?? undefined,
    ogImage: data.value.seo?.ogImageUrl ?? undefined,
  })
}
</script>

<template>
  <main>
    <h1>{{ data?.title }}</h1>
  </main>
</template>
```

### `pages/[slug].vue` — same pattern for dynamic pages

```vue
<script setup lang="ts">
const route = useRoute()
const { data } = await useAsyncData(`page-${route.params.slug}`, () =>
  $fetch(`/api/pages/${route.params.slug}`)
)

if (data.value) {
  useSeoMeta({
    title: data.value.seo?.title ?? data.value.title,
    description: data.value.seo?.description ?? undefined,
    ogTitle: data.value.seo?.title ?? data.value.title,
    ogDescription: data.value.seo?.description ?? undefined,
    ogImage: data.value.seo?.ogImageUrl ?? undefined,
  })
}
</script>
```

---

## Key rules

- **`useSeoMeta()` is auto-imported** — never add an explicit import statement.

- **Null-guard before calling `useSeoMeta()`** — `data.value` may be `null` on first render
  or when the route does not match. Always check `if (data.value)` before calling the
  composable to avoid runtime errors.

- **Fallback chain** — use `seo.title ?? page.title` so that pages without a dedicated SEO
  title still produce a meaningful `<title>` tag.

- **`ogImage` must be a full URL** — use `"ogImageUrl": ogImage.asset->url` in GROQ (the
  `->` dereference) to resolve the image asset to its CDN URL. Passing an asset reference
  object directly will not work.

- **`useHead()` is reserved for non-meta tags** — use `useSeoMeta()` for all `<meta>` and
  `<title>` tags. Use `useHead()` only for other `<head>` elements such as `<link>` or
  `<script>`.

---

## Official docs

- useSeoMeta: https://nuxt.com/docs/api/composables/use-seo-meta
- @nuxtjs/seo: https://nuxtseo.com/
- Sanity image asset dereference (`->`): https://www.sanity.io/docs/groq-functions#3bec00cf6861
