# Sitemap URLs with i18n Locale Prefixes

## Why it matters

The Display Nuxt Starter uses the `prefix_except_default` i18n strategy: the default locale
(`en`) has **no URL prefix** (`/works/my-slug`), while non-default locales carry a prefix
(`/it/works/my-slug`). Sitemap handlers that ignore this strategy produce wrong URLs — either
double-prefixing the default locale or omitting the prefix for non-default locales. Stega
encoding on slug fields is an additional hazard in server-side handlers where visual editing
context is active.

---

## Incorrect

```ts
// server/api/__sitemap__/works.ts
export default defineSitemapEventHandler(async () => {
  const works = await useSanity().fetch(`*[_type == "work"]{ "slug": slug.current }`)

  return works.flatMap((w) => [
    { loc: `/en/works/${w.slug}` }, // ❌ default locale must not have /en/ prefix
    { loc: `/works/${w.slug}` },    // ❌ non-default locale missing /it/ prefix
    // ❌ slugs not cleaned — stega encoding may corrupt URLs
    // ❌ _sitemap key missing — URLs not routed to per-locale sitemaps
  ])
})
```

---

## Correct

### `nuxt.config.ts` — declare strategy explicitly

```ts
export default defineNuxtConfig({
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: ['en', 'it'],
  },
  sitemap: {
    sources: ['/api/__sitemap__/works'],
    sitemaps: true, // generate per-locale sitemaps
  },
})
```

### Sitemap handler — correct locale prefix logic with stegaClean

```ts
// server/api/__sitemap__/works.ts
import { stegaClean } from '@sanity/client/stega'

export default defineSitemapEventHandler(async () => {
  const query = `*[_type == "work" && visible == true]{ "slug": slug.current }`
  const works = await useSanity().fetch<Array<{ slug: string }>>(query, {}, { stega: false })

  return works.flatMap((work) => {
    const cleanSlug = stegaClean(work.slug)
    return [
      // default locale (en): no prefix
      { loc: `/works/${cleanSlug}`, _sitemap: 'en' },
      // non-default locale (it): add prefix
      { loc: `/it/works/${cleanSlug}`, _sitemap: 'it' },
    ]
  })
})
```

---

## Key rules

- **Declare `strategy: 'prefix_except_default'` explicitly** in `nuxt.config.ts`. Relying on
  the default prevents `@nuxtjs/i18n` and `@nuxtjs/sitemap` from agreeing on which locale
  owns which URL shape.

- **Pass `{ stega: false }` in the fetch options** to disable stega encoding at the source.
  Sitemap handlers run server-side where visual editing is not active, so stega encoding adds
  no value and can corrupt URLs.

- **Always call `stegaClean()` on slugs** as a second line of defence. If the fetch option is
  forgotten or the data comes from a shared cached response, `stegaClean()` strips any
  invisible encoding characters before the slug enters the `loc` string.

- **Use `_sitemap: 'en'` / `_sitemap: 'it'`** to route each URL entry to the correct
  per-locale sitemap when `@nuxtjs/sitemap` generates separate sitemap files for each locale.

---

## Official docs

- Sitemap sources: https://nuxtseo.com/sitemap/guides/dynamic-urls
- `@nuxtjs/sitemap` event handlers: https://nuxtseo.com/sitemap/nitro/sitemap-event-handler
- `@nuxtjs/i18n` routing strategies: https://i18n.nuxtjs.org/docs/guide/routing-strategies
- stegaClean: https://www.sanity.io/docs/presenting-content#ZvBhBpv9pjHBlPM
