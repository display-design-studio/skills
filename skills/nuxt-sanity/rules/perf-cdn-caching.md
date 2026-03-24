# CDN Caching, Preview Bypass, Cache Tagging, and Invalidation

> This file covers the two-layer HTTP/CDN caching model used in the Display Nuxt Starter. For
> query-level Nitro cache reactivity see `perf-query-keys-and-caching.md`. For the full
> architecture overview see `arch-starter-pattern.md`.

---

## Two-layer caching model

A single `Cache-Control` header drives both browser cache and CDN. This starter uses:

```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400
```

| Layer | TTL | Purpose |
|-------|-----|---------|
| Browser | 3600 s (1 h) | Browser holds fresh copy; validates after 1 hour |
| CDN | 86400 s (24 h) | CDN holds indefinitely (refreshed via ISR/SWR or webhook purge) |
| SWR buffer | 86400 s (24 h) | If CDN purged but not regenerated, serve stale for up to 24h |

**Rationale**: Browser 1-hour window balances freshness vs. origin hits. CDN 24h + SWR means stale content is always available even during regeneration.

For search or other high-churn routes, override with shorter TTLs:
```ts
// Example: search results (short-lived, high-change frequency)
{ loc: '/search', ..., headers: { 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300' } }
```

---

## `routeRules` in `nuxt.config.ts`

Choose **ISR** (recommended for webhook-driven invalidation) or **SWR** (fallback when webhook unavailable):

**ISR (Incremental Static Regeneration)**

```ts
routeRules: {
  '/**': { isr: true },      // static until webhook purge
  '/api/**': { isr: false },  // API routes: manage own cache
}
```

- Static HTML cached at edge indefinitely
- Freshness driven by webhook purge, not TTL
- Pairs with `POST /api/cache/revalidate` (Sanity webhook)
- **Recommended** for this starter

**SWR (Stale-While-Revalidate)**

```ts
routeRules: {
  '/**': { swr: 86400 },      // serve stale, regenerate in background
  '/api/**': { swr: false },
}
```

- Serves old HTML immediately when TTL expires
- Regeneration happens in background (24h TTL)
- Use **only** when webhook-based invalidation unavailable
- Less fresh content but always performant

Both strategies pair with the same `Cache-Control` header:
```ts
headers: {
  'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
}
```

---

## Preview bypass middleware

File: `server/middleware/sanity-preview-cache.ts`

```ts
// server/middleware/sanity-preview-cache.ts
export default defineEventHandler((event) => {
  const path = getRequestPath(event)
  if (!path.startsWith('/api/') && !path.match(/\.(js|css|woff|ico|png|svg)$/)) {
    // Vary on Cookie only for page routes — avoids fragmenting the CDN cache for API
    // responses and static assets served to anonymous visitors
    appendHeader(event, 'Vary', 'Cookie')
  }

  const cookies = parseCookies(event)
  if (cookies['sanity-preview-id']) {
    // Disable all caching for preview sessions
    setHeader(event, 'cache-control', 'no-store')
    event.context.nitro = event.context.nitro ?? {}
    event.context.nitro.noCache = true
  }
})
```

- `Vary: Cookie` is set **only on page routes** — not on `/api/*` or static assets — to avoid fragmenting the CDN cache for regular visitors
- When the `sanity-preview-id` cookie is present, `no-store` prevents any CDN or browser caching
- `event.context.nitro.noCache = true` disables Nitro ISR/SWR for that request

---

## Cache tagging (`app/composables/useCacheTag.ts`)

Cache tags enable surgical CDN purge — only pages that rendered a specific document are purged
when that document changes in Sanity.

```ts
// app/composables/useCacheTag.ts
export const useCacheTag = (tags: string | string[]) => {
  if (import.meta.server) {
    const event = useRequestEvent()
    if (event) {
      const value = Array.isArray(tags) ? tags.join(',') : tags
      setResponseHeader(event, 'Netlify-Cache-Tag', value)
    }
  }
}
```

- Runs server-side only (`import.meta.server`)
- Sets the `Netlify-Cache-Tag` header with one or more Sanity document tags
- Accepts a single `string` or an `array` of strings — array is joined as comma-separated
- Uses `setResponseHeader` (overwrites) rather than `appendHeader` (appends) to avoid duplicate tag headers
- Netlify uses these tags to purge exactly the pages that rendered those documents

**Usage patterns:**

```ts
// Single-document page (e.g. /posts/[slug])
if (post.value) {
  useCacheTag(post.value._id)
}

// Listing page — tag with both the listing doc id and the content type
if (listing.value) {
  useCacheTag([listing.value._id, 'post'])
}

// Listing page with multiple referenced types
if (listing.value) {
  useCacheTag([listing.value._id, 'post', 'category'])
}
```

> **IMPORTANT:** `useCacheTag` uses `setResponseHeader` which **overwrites** on each call.
> Always pass all tags in a **single array call**. Never call `useCacheTag` multiple times on
> the same page — only the last call's tags will be set.

---

## `POST /api/cache/revalidate` — Sanity webhook invalidation

Triggered by a Sanity webhook on document publish. Validates the webhook secret, then purges the
CDN by document `_id` tag and clears the Nitro storage entry for that document.

```ts
// server/api/cache/revalidate.post.ts
import { purgeCache } from '@netlify/functions'

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-sanity-webhook-secret')
  if (secret !== useRuntimeConfig().sanityWebhookSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody<{ _id: string; _type?: string }>(event)

  // Purge by both _id (individual page) and _type (listing pages for that content type)
  const tags = [body?._id, body?._type].filter(Boolean)
  await purgeCache({ tags })

  return { purged: true, tags }
})
```

> **GROQ projection:** The Sanity webhook must include `_type` in its projection so the handler
> receives it: `{ _id, _type }`.

> **Warning:** Without `_type` purge, listing pages that reference new documents will never
> refresh after a publish — they stay stale until a full redeploy.

> **Warning:** Do NOT call `useStorage('cache').clear()` here — it nukes all Nitro cache
> entries simultaneously, making every page go cold on every Sanity publish.

---

## `POST /api/cache/purge` — manual / deploy purge

Used for manual cache clearing or post-deploy hooks. Validates a shared secret, then purges by
`_id` tag or performs a full CDN purge.

```ts
// server/api/cache/purge.post.ts
import { purgeCache } from '@netlify/functions'

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-purge-secret')
  if (secret !== useRuntimeConfig().purgeSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { _id } = await readBody<{ _id?: string }>(event)

  if (_id) {
    // Surgical purge: only pages tagged with this _id
    await purgeCache({ tags: [_id] })
  } else {
    // Full CDN purge + clear all Nitro cache keys
    await purgeCache({})
    const storage = useStorage('cache')
    const keys = await storage.getKeys()
    await Promise.all(keys.map((k) => storage.removeItem(k)))
  }

  return { purged: true }
})
```

---

## Netlify note

`purgeCache` is imported from `@netlify/functions` and is Netlify-specific. When deploying to a
different platform, replace it with that platform's CDN purge API.

---

## Debug headers

Use these response headers to verify cache behaviour:

| Header | Values | Provider |
|--------|--------|----------|
| `X-Cache` | `HIT` / `MISS` | Netlify CDN |
| `Cf-Cache-Status` | `HIT` / `MISS` / `EXPIRED` | Cloudflare (if used) |
| `Cache-Control` | Full policy string | Any |
| `Netlify-Cache-Tag` | Tag(s) registered for the response | Netlify |

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NUXT_PURGE_SECRET` | Shared secret for `POST /api/cache/purge` (manual/deploy purge) |
| `NUXT_SANITY_WEBHOOK_SECRET` | Shared secret for `POST /api/cache/revalidate` (Sanity webhook) |

Both map to `runtimeConfig` automatically via Nuxt's `NUXT_*` convention:

```ts
// nuxt.config.ts
runtimeConfig: {
  purgeSecret: '',           // set via NUXT_PURGE_SECRET
  sanityWebhookSecret: '',   // set via NUXT_SANITY_WEBHOOK_SECRET
},
```

Both secrets must be present in **three places**:

1. `nuxt.config.ts` `runtimeConfig` — declares the key (empty string placeholder)
2. `.env` — local development value
3. `.env.example` — placeholder so other developers know the variable is required
4. Netlify environment variables — production value

> **Warning:** If `NUXT_SANITY_WEBHOOK_SECRET` is missing from the runtime environment,
> `useRuntimeConfig().sanityWebhookSecret` is `''` and never matches the incoming header —
> every webhook call returns 401 with no visible error in Studio.
