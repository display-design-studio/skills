# Nitro Server Routes with Sanity

## Why it matters

Server routes can access private datasets and auth tokens that must never reach
the client bundle. `validateSanityQuery` prevents query injection when proxying
user-supplied GROQ queries. Tokens in `runtimeConfig.public` are shipped to every
client — a security breach.

---

## Accessing useSanity() in a Nitro server route

In `server/api/*.ts` files, import `useSanity` from `#imports`:

```ts
// server/api/posts.get.ts
import { useSanity } from '#imports'

export default defineEventHandler(async (event) => {
  const client = useSanity()
  const posts = await client.fetch<Post[]>(`*[_type == "post"] | order(_createdAt desc)`)
  return posts
})
```

> `useSanity` in server routes uses the module's server-side client: no CDN, and automatically includes the token from `runtimeConfig.sanity.token` (set via `NUXT_SANITY_TOKEN`) when present.

---

## Using the auth token in server routes

Configure the token in `runtimeConfig` (private), not `runtimeConfig.public`:

```ts
// nuxt.config.ts
runtimeConfig: {
  sanity: {
    token: '', // set via NUXT_SANITY_TOKEN env var at runtime
  },
},

sanity: {
  projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
},
```

```env
# .env
NUXT_SANITY_TOKEN=sk...   # private — NEVER use NUXT_PUBLIC_SANITY_TOKEN
```

The module automatically uses `runtimeConfig.sanity.token` for server-side requests when set.

---

## validateSanityQuery — prevent query injection

Use `validateSanityQuery` whenever you accept a user-supplied GROQ query string:

```ts
// server/api/proxy.post.ts
import { useSanity, validateSanityQuery } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validates the query is a read-only GROQ expression (no mutations)
  const query = validateSanityQuery(body.query)

  const client = useSanity()
  return await client.fetch(query, body.params ?? {})
})
```

---

## Private dataset proxy pattern

Expose a server route that applies the auth token — the client never sees the token:

```ts
// server/api/preview.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  // token is available server-side only via runtimeConfig.sanity.token
  const client = useSanity()
  const slug = getQuery(event).slug as string
  return await client.fetch<Post>(
    `*[_type == "post" && slug.current == $slug][0]`,
    { slug }
  )
})
```

Client calls `/api/preview?slug=hello` — token stays on the server.

---

## Cached Sanity endpoint conventions

Production handlers in `server/api/sanity/<scope>.get.ts` follow this template:

```ts
// server/api/sanity/<scope>.get.ts
import { createError, getQuery, setHeader } from 'h3'
import { <scope>Query } from '~~/shared/utils/<scope>Query'

const browserMaxAge = 3600   // browser-fresh window
const cdnMaxAge = 86400      // CDN s-maxage

/**
 * GET /api/sanity/<scope>
 *
 * Returns <description> from Sanity CMS.
 * Served from Nitro in-memory cache; CDN adds s-maxage=86400.
 *
 * @query lang - BCP-47 locale code (default: 'en')
 * @query slug - Document slug (required)
 * @throws 400 if required params are missing
 * @cache max-age=3600 (browser), s-maxage=86400 (CDN)
 */
export default defineCachedEventHandler(
  async (event) => {
    const { lang = 'en', slug } = getQuery<{ lang?: string; slug?: string }>(event)

    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Missing slug' })

    setHeader(
      event,
      'Cache-Control',
      `public, max-age=${browserMaxAge}, s-maxage=${cdnMaxAge}, stale-while-revalidate=${cdnMaxAge}`
    )

    const sanity = useSanity()
    return sanity.fetch(<scope>Query, { lang, slug }, { stega: false })
  },
  {
    maxAge: cdnMaxAge,
    getKey: (event) => {
      const { lang = 'en', slug = '' } = getQuery<{ lang?: string; slug?: string }>(event)
      return `<scope>:${lang}:${slug}`   // stable format: 'scope:lang:param'
    },
  }
)
```

Conventions:

- **TTL constants** (`browserMaxAge`, `cdnMaxAge`) declared at module scope — easy to read and
  override per route. Search routes use shorter values (`60` / `300`).
- **`stega: false`** as third argument to `sanity.fetch()` — prevents stega encoding from leaking
  into cached responses served to regular visitors.
- **`getKey` format** `'scope:lang:param'` — stable, unique, human-readable.
- **`@query` JSDoc tag** documents GET query parameters inline, mirroring `@throws` and `@cache`.

---

## Incorrect

```ts
// ❌ Token in runtimeConfig.public — ships to client bundle
runtimeConfig: {
  public: {
    sanityToken: 'sk...', // exposed to browser
  },
},
```

## Correct

```ts
// ✅ Token in runtimeConfig (private) — server only, set via NUXT_SANITY_TOKEN
runtimeConfig: {
  sanity: {
    token: '', // auto-populated from NUXT_SANITY_TOKEN at runtime
  },
},
```

---

## Docs

- Server routes: https://sanity.nuxtjs.org/server
- validateSanityQuery: https://sanity.nuxtjs.org/server#validate-sanity-query
- Nuxt server routes: https://nuxt.com/docs/guide/directory-structure/server
