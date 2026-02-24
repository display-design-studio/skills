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

> `useSanity` in server routes uses the module's server-side client (no CDN, with token if configured).

---

## Using the auth token in server routes

Configure the token in `runtimeConfig` (private), not `runtimeConfig.public`:

```ts
// nuxt.config.ts
runtimeConfig: {
  sanity: {
    token: process.env.SANITY_API_READ_TOKEN,
  },
},

sanity: {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
},
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

## Incorrect

```ts
// ❌ Token in runtimeConfig.public — ships to client bundle
runtimeConfig: {
  public: {
    sanityToken: process.env.SANITY_API_READ_TOKEN, // exposed to browser
  },
},
```

## Correct

```ts
// ✅ Token in runtimeConfig (private) — server only
runtimeConfig: {
  sanity: {
    token: process.env.SANITY_API_READ_TOKEN,
  },
},
```

---

## Docs

- Server routes: https://sanity.nuxtjs.org/server
- validateSanityQuery: https://sanity.nuxtjs.org/server#validate-sanity-query
- Nuxt server routes: https://nuxt.com/docs/guide/directory-structure/server
