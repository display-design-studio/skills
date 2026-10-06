# Dynamic Sitemap URLs from Sanity

Use an `@nuxtjs/sitemap` source for routes that exist only in Sanity. Static Nuxt pages are discovered
separately and do not need to be duplicated in the source.

## Starter configuration

```ts
sitemap: {
  sources: ['/api/__sitemap__/urls'],
  cacheMaxAgeSeconds: 86400,
},
```

The sitemap module owns this 24-hour cache, so repeated sitemap requests do not repeatedly query
Sanity. Route changes can take up to 24 hours to appear until sitemap-specific webhook invalidation is
implemented. Do not place a second endpoint cache in front of it unless both layers participate in the
same invalidation strategy.

## Handler

Fetch anonymous published content, disable stega at the source, validate the fields used in URLs, and
translate upstream errors to 502 rather than returning an empty sitemap as if it were valid.

```ts
import { stegaClean } from '@sanity/client/stega'

interface SitemapPage {
  slug: string
  language: string
}

const localePrefixes = { en: '', it: '/it' } as const

export default defineSitemapEventHandler(async () => {
  const sanity = useSanity()
  let pages: SitemapPage[]

  try {
    pages = await sanity.fetch<SitemapPage[]>(
      `*[_type == "page" && defined(slug[language].current)] {
        "slug": slug[language].current,
        language
      }`,
      {},
      { stega: false },
    )
  }
  catch (error) {
    console.error('Failed to fetch Sanity pages for the sitemap', error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch from Sanity' })
  }

  return pages.flatMap((page) => {
    const prefix = localePrefixes[page.language as keyof typeof localePrefixes]
    const slug = stegaClean(page.slug)
    if (prefix === undefined || !slug || slug.includes('/'))
      return []

    return [{
      loc: `${prefix}/${slug}`,
      _sitemap: page.language,
    }]
  })
})
```

The locale-prefix map must follow the application's actual i18n strategy. For the Display Starter's
`prefix_except_default` policy, English has no prefix and non-default locales do. See
`features-sitemap-i18n.md` for the concrete implementation.

Even with `{ stega: false }`, `stegaClean()` is a cheap defensive boundary before a Sanity string is
inserted into a URL. Also reject missing, unsupported, or path-breaking locale/slug values rather than
emitting invalid sitemap entries.

## Rules

- Keep sitemap queries on the published perspective.
- Do not use a preview token or expose drafts in a public sitemap.
- Do not hardcode `/en` when the default locale is unprefixed.
- Keep `loc` relative or use the site's canonical configured origin consistently.
- Assign `_sitemap` only when the sitemap module is configured for locale-specific output.
- Do not swallow Sanity failures into an empty array; that can temporarily remove all dynamic URLs
  from the generated sitemap.

## Docs

- Dynamic sources: https://nuxtseo.com/sitemap/guides/dynamic-urls
- Sitemap event handlers: https://nuxtseo.com/sitemap/nitro/sitemap-event-handler
- i18n sitemap routing: `features-sitemap-i18n.md`
