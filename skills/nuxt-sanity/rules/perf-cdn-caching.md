# CDN Caching, Preview Bypass, Cache Tagging, and Invalidation

> This file covers the two-layer HTTP/CDN caching model used in the Display Nuxt Starter. For
> query-level Nitro cache reactivity see `perf-query-keys-and-caching.md`. For the full
> architecture overview see `arch-starter-pattern.md`.

---

## Two-layer caching model

| Layer | Who caches | TTL | Header |
|-------|-----------|-----|--------|
| Browser | User's browser | 60 s | `max-age=60` |
| Netlify CDN | Edge network | 24 h + SWR | `s-maxage=86400, stale-while-revalidate=86400` |

A single `Cache-Control` header drives both layers:

```
Cache-Control: public, max-age=60, s-maxage=86400, stale-while-revalidate=86400
```

---

## `routeRules` in `nuxt.config.ts`

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // Pages: Netlify SWR (24 h) + full Cache-Control header
    '/': { swr: 86400, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=86400' } },
    '/**': { swr: 86400, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=86400, stale-while-revalidate=86400' } },

    // API endpoints manage their own Cache-Control headers — disable Nitro SWR here
    '/api/**': { swr: false },
  },
})
```

- Pages use `swr: 86400` to enable Netlify's stale-while-revalidate behaviour at the CDN edge
- `/api/**` sets `swr: false` because each `defineCachedEventHandler` sets its own `Cache-Control`
  header (see `arch-extension-pattern.md` Step 2)

---

## Preview bypass middleware

File: `server/middleware/sanity-preview-cache.ts`

```ts
// server/middleware/sanity-preview-cache.ts
export default defineEventHandler((event) => {
  // Always vary on Cookie so CDN separates anonymous vs preview sessions
  appendHeader(event, 'Vary', 'Cookie')

  const cookies = parseCookies(event)
  if (cookies['sanity-preview-id']) {
    // Disable all caching for preview sessions
    setHeader(event, 'cache-control', 'no-store')
    event.context.nitro = event.context.nitro ?? {}
    event.context.nitro.noCache = true
  }
})
```

- `Vary: Cookie` ensures the CDN stores separate cache entries for anonymous vs preview users
- When the `sanity-preview-id` cookie is present, `no-store` prevents any CDN or browser caching
- `event.context.nitro.noCache = true` disables Nitro ISR/SWR for that request

---

## Cache tagging (`app/composables/useCacheTag.ts`)

Cache tags enable surgical CDN purge — only pages that rendered a specific document are purged
when that document changes in Sanity.

```ts
// app/composables/useCacheTag.ts
export const useCacheTag = (id: string) => {
  if (import.meta.server) {
    const event = useRequestEvent()
    if (event) {
      appendHeader(event, 'Netlify-Cache-Tag', id)
    }
  }
}
```

- Runs server-side only (`import.meta.server`)
- Sets the `Netlify-Cache-Tag` header with the Sanity document `_id`
- Netlify uses this tag to purge exactly those pages when the document is invalidated
- Called in pages after the null-guard: `if (data.value) { useCacheTag(data.value._id) }`

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

  const body = await readBody<{ _id: string; _type: string }>(event)
  const { _id, _type } = body

  // Purge CDN pages tagged with this document's _id
  await purgeCache({ tags: [_id] })

  // Clear Nitro storage cache for the affected endpoint
  const storage = useStorage('cache')
  const keys = await storage.getKeys()
  const affected = keys.filter((k) => k.includes(_type))
  await Promise.all(affected.map((k) => storage.removeItem(k)))

  return { purged: true, _id }
})
```

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
