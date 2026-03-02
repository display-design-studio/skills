# Sitemap — @nuxtjs/sitemap

## Why it matters

A sitemap tells search engines which URLs exist, their priority, and when they
were last modified. Without one, crawlers discover pages slowly via links —
meaning new or deep pages may never be indexed. `@nuxtjs/sitemap` auto-generates
`/sitemap.xml` from Nuxt routes, prerender rules, and dynamic data sources,
eliminating manual maintenance.

---

## Installation

```bash
npx nuxi module add @nuxtjs/sitemap
```

Requires `site.url` to be set in `nuxt.config.ts` (see `core-site-config.md`).

---

## Incorrect

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  // ❌ no site.url set — sitemap entries will have relative or incorrect URLs
  // ❌ dynamic routes (e.g. /blog/[slug]) are not discoverable without a data source
})
```

---

## Correct — static routes (auto-detected)

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  site: { url: 'https://example.com' },

  sitemap: {
    // Exclude paths you don't want in the sitemap
    exclude: ['/admin/**', '/api/**'],
  },
})
```

All pages under `pages/` are included automatically. No additional config needed
for static routes.

---

## Dynamic URLs via server handler

For dynamic routes (e.g., `/blog/[slug]`, `/products/[id]`), provide URLs through
a server event handler:

```ts
// server/api/__sitemap__/urls.ts
import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const posts = await $fetch('/api/posts')  // fetch from your CMS or DB

  return posts.map((post) => ({
    loc: `/blog/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: 'weekly',
    priority: 0.8,
  }))
})
```

The module fetches this handler during build (prerender) or at runtime (SSR).

---

## Multi-sitemap

Split large sites into category-specific sitemaps:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  sitemap: {
    sitemaps: {
      pages: {
        include: ['/', '/about', '/contact'],
      },
      blog: {
        sources: ['/api/__sitemap__/blog-urls'],
      },
      products: {
        sources: ['/api/__sitemap__/product-urls'],
      },
    },
  },
})
```

This generates `/sitemap_index.xml` linking to `/pages-sitemap.xml`,
`/blog-sitemap.xml`, and `/products-sitemap.xml`.

---

## i18n integration

With `@nuxtjs/i18n`, alternate language URLs (`hreflang`) are added automatically:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n', '@nuxtjs/sitemap'],
  i18n: {
    locales: [
      { code: 'en', language: 'en-US' },
      { code: 'it', language: 'it-IT' },
    ],
    defaultLocale: 'en',
  },
  // sitemap auto-detects i18n config — no extra sitemap config needed
})
```

---

## Debug

Open `/__sitemap__/debug.json` in dev mode to inspect all resolved sitemap
entries and verify dynamic URLs are included.

---

## Official docs

- Installation: https://nuxtseo.com/sitemap/getting-started/installation
- Dynamic URLs: https://nuxtseo.com/sitemap/guides/dynamic-urls
- Multi-sitemap: https://nuxtseo.com/sitemap/guides/multi-sitemaps
- i18n integration: https://nuxtseo.com/sitemap/integrations/i18n
- Debugging: https://nuxtseo.com/sitemap/guides/debugging
