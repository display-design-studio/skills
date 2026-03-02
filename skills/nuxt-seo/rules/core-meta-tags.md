# Meta Tags — useHead, useSeoMeta, app.head

## Why it matters

Nuxt provides two composables for managing `<head>` tags: `useSeoMeta` (type-safe,
SEO-focused) and `useHead` (flexible, full control). Without proper head management,
pages share the same title and description, og:image may be missing or relative,
and social previews break. Using these correctly is foundational before adding any
`@nuxtjs/seo` module features.

---

## useSeoMeta — type-safe SEO meta

Use `useSeoMeta` for all SEO-relevant meta tags. It provides TypeScript autocompletion
for every known meta name and prevents typos in property names.

### Incorrect

```ts
// pages/about.vue
// ❌ useHead with raw meta array — no type safety, easy to mistype property names
useHead({
  meta: [
    { property: 'og:tittle', content: 'About Us' }, // typo — undetected
    { name: 'description', content: 'Learn about us.' },
  ],
})
```

### Correct

```ts
// pages/about.vue
useSeoMeta({
  title: 'About Us',
  description: 'Learn about our team and mission.',
  ogTitle: 'About Us',
  ogDescription: 'Learn about our team and mission.',
  ogImage: 'https://example.com/og/about.png',  // must be absolute URL
  twitterCard: 'summary_large_image',
})
```

---

## useHead — full head control

Use `useHead` when you need to manage non-SEO head elements: scripts, stylesheets,
`<link rel="preload">`, or arbitrary tags not covered by `useSeoMeta`.

```ts
// composables/useAnalytics.ts
useHead({
  script: [
    { src: 'https://cdn.example.com/analytics.js', async: true, defer: true },
  ],
  link: [
    { rel: 'preload', href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
  ],
})
```

---

## app.head — global static defaults

Set site-wide defaults once in `nuxt.config.ts`. These apply to every page and
are merged with page-level `useSeoMeta` / `useHead` calls (page values win).

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
```

---

## titleTemplate — consistent page titles

```ts
// nuxt.config.ts — apply site name suffix to every page title
export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: '%s — My Site',  // %s is replaced by the page's title
    },
  },
})

// pages/about.vue — renders as "About Us — My Site"
useSeoMeta({ title: 'About Us' })
```

Use `%s %separator %siteName` format with `nuxt-seo-utils` for automatic separator
handling based on locale.

---

## Template components (alternative syntax)

Use `<Title>`, `<Meta>`, `<Link>` components inside `<template>` as an alternative
to composables when you prefer template-driven head management:

```vue
<!-- pages/about.vue -->
<template>
  <div>
    <Title>About Us</Title>
    <Meta name="description" content="Learn about our team." />
    <Meta property="og:image" content="https://example.com/og/about.png" />
  </div>
</template>
```

---

## useSeoMeta vs useHead — when to use each

| Scenario | Use |
|----------|-----|
| og:title, og:description, twitter:card, canonical | `useSeoMeta` |
| Custom scripts, preload links, arbitrary meta | `useHead` |
| Server-only head (no hydration cost) | `useServerHead` / `useServerSeoMeta` |
| Global static defaults | `app.head` in nuxt.config.ts |

---

## Official docs

- SEO and meta guide: https://nuxt.com/docs/getting-started/seo-meta
- useSeoMeta: https://nuxt.com/docs/api/composables/use-seo-meta
- useHead: https://nuxt.com/docs/api/composables/use-head
- app.head config: https://nuxt.com/docs/api/nuxt-config#head
