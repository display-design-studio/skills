# Dynamic Sitemap with Sanity

## Why it matters

`@nuxtjs/sitemap` supports **dynamic sources** via `sitemap.sources` in `nuxt.config.ts`.
Without proper server handlers, dynamic Sanity-driven routes (works, case studies, etc.)
are missing from the sitemap, hurting SEO indexing.

Static pages are included automatically — sources are only needed for dynamic routes
fetched from Sanity.

---

## Incorrect

```ts
// nuxt.config.ts — no sources configured
sitemap: {}

// Dynamic routes from Sanity are never added to the sitemap
```

```ts
// server/api/__sitemap__/works.ts — slug not cleaned
export default defineSitemapEventHandler(async () => {
  const works = await useSanity().fetch(`*[_type == "work"]{ "slug": slug.current }`);
  return works.map((w) => ({ loc: `/en/works/${w.slug}` }));
  // ❌ stega-encoded slugs break URLs in visual editing context
});
```

---

## Correct

### `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  sitemap: {
    sources: ['/api/__sitemap__/works', '/api/__sitemap__/case-studies'],
    exclude: ['/showcase/**'],
  },
})
```

### Handler — shared slug (bilingual)

Use when a single slug is shared across all locales:

```ts
// server/api/__sitemap__/works.ts
import { stegaClean } from '@sanity/client/stega'

export default defineSitemapEventHandler(async () => {
  const query = `*[_type == "work" && visible == true]{ "slug": slug.current }`
  const works = await useSanity().fetch<Array<{ slug: string }>>(query)

  return works.flatMap((work) => [
    { loc: `/en/works/${stegaClean(work.slug)}`, _sitemap: 'en' },
    { loc: `/it/works/${stegaClean(work.slug)}`, _sitemap: 'it' },
  ])
})
```

### Handler — per-locale slug (bilingual)

Use when EN and IT have distinct slugs stored separately in Sanity:

```ts
// server/api/__sitemap__/case-studies.ts
import { stegaClean } from '@sanity/client/stega'

export default defineSitemapEventHandler(async () => {
  const query = `*[_type == "caseStudy"]{ "slugEn": slug.en.current, "slugIt": slug.it.current }`
  const caseStudies = await useSanity().fetch<Array<{ slugEn: string; slugIt: string }>>(query)

  return caseStudies.flatMap((cs) => [
    { loc: `/en/case-studies/${stegaClean(cs.slugEn)}`, _sitemap: 'en' },
    { loc: `/it/casi-studio/${stegaClean(cs.slugIt)}`, _sitemap: 'it' },
  ])
})
```

---

## Key rules

- **Always call `stegaClean()` on slugs** before building `loc`. Sanity's visual editing
  injects invisible stega encoding characters into field values; without cleaning, URLs
  contain invisible characters that break sitemap validation and browser navigation.

- **`_sitemap: "en"/"it"`** assigns each URL to the correct per-locale sitemap when
  `@nuxtjs/i18n` generates separate sitemaps.

- **`useSanity()`** is an auto-import from `@nuxtjs/sanity` — no explicit import needed
  in server handlers.

- **`defineSitemapEventHandler`** is an auto-import from `@nuxtjs/sitemap` — no explicit
  import needed in server handlers.

---

## Official docs

- Sitemap sources: https://nuxtseo.com/sitemap/guides/dynamic-urls
- `@nuxtjs/sitemap` event handlers: https://nuxtseo.com/sitemap/nitro/sitemap-event-handler
- stegaClean: https://www.sanity.io/docs/presenting-content#ZvBhBpv9pjHBlPM
