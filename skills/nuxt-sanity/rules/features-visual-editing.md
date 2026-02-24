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

## Draft mode toggle

Enable draft mode via a server route that sets a cookie:

```ts
// server/api/draft-mode.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  if (query.enable) {
    setCookie(event, '__prerender_bypass', '1', { httpOnly: true, sameSite: 'none', secure: true })
    return sendRedirect(event, query.redirect as string || '/')
  }

  deleteCookie(event, '__prerender_bypass')
  return sendRedirect(event, '/')
})
```

In composables, check draft mode to switch `useCdn`:

```ts
const isDraftMode = useCookie('__prerender_bypass')
const { data } = await useSanityQuery(query, params, {
  perspective: isDraftMode.value ? 'previewDrafts' : 'published',
})
```

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
          enable: '/api/draft-mode?enable=true',
          disable: '/api/draft-mode?enable=false',
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
