# Visual Editing and Live Preview in Nuxt

## Why it matters

Visual editing requires stega-encoded strings in draft mode responses and a correctly
configured Presentation tool URL. Auth tokens must never be in `runtimeConfig.public`.
A misconfigured token or missing `stegaClean()` call causes broken comparisons or
data leaking into the client bundle.

---

## Module configuration for visual editing

```ts
// nuxt.config.ts
sanity: {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // must be false for draft/visual editing
  visualEditing: {
    studioUrl: process.env.SANITY_STUDIO_URL || 'http://localhost:3333',
    token: undefined, // ← DO NOT set here; use runtimeConfig.sanity.token instead
  },
},
runtimeConfig: {
  sanity: {
    token: process.env.SANITY_API_READ_TOKEN, // private — server only
  },
},
```

The module automatically picks up `runtimeConfig.sanity.token` for draft-mode requests.

---

## Preview mode — native module endpoints

`@nuxtjs/sanity` provides built-in endpoints at `/preview/enable` and `/preview/disable`.
These are the only preview toggle routes used — no custom `/api/draft-mode` route is needed.

When `/preview/enable` is called, the module sets a `sanity-preview-id` cookie and activates
`perspective: 'previewDrafts'` for subsequent requests on that session.

The preview cache guard in `server/middleware/sanity-preview-cache.ts` reads this cookie to
disable Nitro and CDN caching for preview sessions (see `perf-cdn-caching.md`).

Do NOT add a custom draft-mode server route — it is redundant and would use a different cookie
(`__prerender_bypass`) that the cache middleware does not check.

> **Search exception:** `useSanitySearch` (or any search composable) always routes through the
> cached API endpoint and never uses the preview path. Draft content must not appear in search
> results — published content only.

---

## Stega encoding

When visual editing is active, Sanity injects invisible stega metadata into string fields.
Strings will contain embedded source map data that powers click-to-edit overlays.

**Important:** Always call `stegaClean()` before string comparisons or key lookups:

```ts
import { stegaClean } from '@sanity/client/stega'

// ❌ Can fail silently — stega metadata changes the string value
if (post.category === 'news') { ... }

// ✅ Strip stega before comparing
if (stegaClean(post.category) === 'news') { ... }
```

→ See `sanity-best-practices/rules/visual-editing-stega-clean.md` for full stegaClean patterns.

---

## `stega: false` on server-side fetches

All `server/api/sanity/*.get.ts` handlers must pass `{ stega: false }` as the third argument to
`sanity.fetch()`:

```ts
return sanity.fetch(query, params, { stega: false })
```

Sanity's stega encoding injects invisible metadata into string fields to power Visual Editing
overlays. Without `{ stega: false }`, this metadata leaks into cached API responses and is served
to regular visitors who have no Visual Editing context. See `perf-query-keys-and-caching.md` for
the cache angle.

---

## Preview cache guard — scope restriction

The preview bypass middleware (`server/middleware/sanity-preview-cache.ts`) sets
`Cache-Control: no-store` and `Vary: Cookie` **only on page routes**, not on `/api/*` or static
assets:

```ts
const path = getRequestPath(event)
if (!path.startsWith('/api/') && !path.match(/\.(js|css|woff|ico|png|svg)$/)) {
  appendHeader(event, 'Vary', 'Cookie')
}
```

Setting `Vary: Cookie` on API routes would fragment the CDN cache — the CDN would store separate
entries per cookie value, degrading cache efficiency for anonymous users and inflating edge memory.

---

## Presentation tool configuration in Sanity Studio

In your Sanity Studio project, configure the Presentation tool to point to your Nuxt app:

```ts
// sanity.config.ts (in Studio)
import { presentationTool } from 'sanity/presentation'

export default defineConfig({
  plugins: [
    presentationTool({
      previewUrl: {
        origin: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        previewMode: {
          enable: '/preview/enable',
          disable: '/preview/disable',
        },
      },
    }),
  ],
})
```

---

## Incorrect

```env
# ❌ Token in a NUXT_PUBLIC_* env var — ships to client bundle
NUXT_PUBLIC_SANITY_TOKEN=sk...
```

```ts
// ❌ Token in runtimeConfig.public
runtimeConfig: {
  public: {
    sanityToken: process.env.NUXT_PUBLIC_SANITY_TOKEN,
  },
},
```

## Correct

```env
# ✅ Private env var
SANITY_API_READ_TOKEN=sk...
```

```ts
// ✅ Token in private runtimeConfig
runtimeConfig: {
  sanity: {
    token: process.env.SANITY_API_READ_TOKEN,
  },
},
```

---

## Docs

- Visual editing: https://sanity.nuxtjs.org/visual-editing
- Presentation tool: https://www.sanity.io/docs/presentation
- Cross-reference: `sanity-best-practices/rules/visual-editing-stega-clean.md`
- Cross-reference: `sanity-best-practices/rules/visual-editing-presentation-tool.md`
