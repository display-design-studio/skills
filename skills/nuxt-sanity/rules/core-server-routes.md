# Nitro Server Routes with Sanity

## Accessing the client

`useSanity()` is auto-imported in Nitro server routes by `@nuxtjs/sanity`. An explicit import from
`#imports` is also valid.

```ts
export default defineEventHandler(async () => {
  const sanity = useSanity()
  return sanity.fetch<Post[]>(postsQuery, {}, { stega: false })
})
```

The server client follows the module configuration. It uses the Sanity API CDN when `useCdn: true`
and remains anonymous unless a token was deliberately configured. Public published-content routes
should not inherit the visual-editing token.

## Validate parameters, not query text interpolation

Use fixed queries and pass user input as GROQ parameters. Validate transport shape and application
constraints before querying: reject arrays where one value is expected, unsupported locales,
control characters, path separators, empty strings, and excessive lengths.

```ts
const { slug } = getQuery(event)
const validatedSlug = validateSanitySlug(slug)
return sanity.fetch(pageQuery, { slug: validatedSlug }, { stega: false })
```

GROQ parameters are JSON values and cannot inject query expressions. Never interpolate request data
into a GROQ query string.

## `validateSanityQuery` is an allowlist check

If an endpoint accepts a query string, `validateSanityQuery()` checks it against queries extracted
from the codebase. It returns `Promise<boolean>`; it does not return a sanitized query and it is not a
general GROQ parser.

```ts
export default defineEventHandler(async (event) => {
  const body = await readBody<{ query?: unknown, params?: Record<string, unknown> }>(event)
  if (typeof body.query !== 'string')
    throw createError({ statusCode: 400, statusMessage: 'Invalid query' })

  await validateSanityQuery(body.query)
  return useSanity().fetch(body.query, body.params ?? {}, { stega: false })
})
```

Do not expose an unrestricted query proxy for a private dataset. An allowlisted proxy still needs
authentication, authorization, request-size limits, and rate limiting appropriate to its audience.

## Display Starter published endpoint

Use a plain `defineEventHandler`. Start no-store, validate inputs, translate upstream failures to a
502, return a no-store 404 for missing documents, and enable Netlify caching only for a successful
published result.

```ts
import type { PageQueryResult } from '#sanity-types'

export default defineEventHandler(async (event) => {
  setNoStore(event)
  const lang = getSanityLocale(event)
  const slug = getSanitySlug(event)
  const sanity = useSanity()
  let result: PageQueryResult

  try {
    result = await sanity.fetch<PageQueryResult>(
      pageQuery,
      { lang, slug },
      { stega: false },
    )
  }
  catch (error) {
    console.error('Failed to fetch the Sanity page document', error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch from Sanity' })
  }

  if (!result)
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  setPublicCdnCache(event, [result._id, result._type])
  return result
})
```

`setPublicCdnCache` must emit:

```http
Cache-Control: public, max-age=0, must-revalidate
Netlify-CDN-Cache-Control: public, durable, max-age=86400, stale-while-revalidate=3600
Netlify-Cache-Tag: <document-id>,<document-type>
```

Do not use `defineCachedEventHandler` for these endpoints on serverless. Its storage is a separate
cache layer that the Netlify tag purge does not invalidate reliably across instances.

For content where the first post-webhook regeneration must be current, derive a server-only live
client for that fetch:

```ts
const sanity = useSanity()
const liveClient = sanity.client.withConfig({ useCdn: false })
const result = await liveClient.fetch(pageQuery, { lang, slug }, { stega: false })
```

Keep `useCdn: true` for the starter's scale-first default and accept the propagation tradeoff
documented in `perf-cdn-caching.md`.

## Private dataset proxy

A private-data endpoint must authenticate the caller before using a token and must always be
`no-store`. Never expose the visual-editing token through a general public API route; use the module's
validated `/_sanity/visual-editing/fetch` proxy for Presentation.

## Docs

- Server routes: https://sanity.nuxtjs.org/server
- Module usage: https://sanity.nuxtjs.org/getting-started/usage
- GROQ parameters: https://www.sanity.io/docs/specifications/groq-parameters
