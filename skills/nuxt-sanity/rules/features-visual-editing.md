# Visual Editing and Live Preview

## Module configuration

Configure a Viewer token under `sanity.visualEditing`. It is used by the module's server-side preview
proxy and is not exposed in public runtime configuration.

```ts
sanity: {
  projectId: process.env.NUXT_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2026-03-10',
  perspective: 'published',
  useCdn: true,
  visualEditing: {
    token: process.env.NUXT_SANITY_VISUAL_EDITING_TOKEN,
    studioUrl: process.env.NUXT_SANITY_VISUAL_EDITING_STUDIO_URL,
    stega: true,
  },
},
```

Do not duplicate this token in `runtimeConfig.sanity.token` unless unrelated authenticated server
reads genuinely require it. Do not use an Editor or Administrator token for preview.

With default `disableSmartCdn: false`, the module disables the Sanity API CDN during Nuxt preview
mode. The global published configuration can remain `useCdn: true`.

## Native preview routes

`@nuxtjs/sanity` supplies `/preview/enable` and `/preview/disable`. The enable route validates the
Presentation preview secret and sets `sanity-preview-id` to a private, generated `previewModeId`.
The module's `/_sanity/visual-editing/fetch` proxy checks the same exact cookie before using the
Viewer token.

Do not add a second draft-mode cookie or treat the mere presence of `sanity-preview-id` as proof of
preview authorization.

## Preview cache isolation on Netlify

Every cacheable page response must declare the same targeted variation, whether the request is public
or preview. Netlify uses the first variation policy stored for a URL.

```ts
// server/middleware/sanity-preview-cache.ts
export default defineEventHandler((event) => {
  const cookies = parseCookies(event)
  const path = getRequestURL(event).pathname
  const isApiRoute = path.startsWith('/api/')
  const isStaticAsset = /\.(?:js|css|woff2?|ico|png|svg)$/.test(path)
  const isSanityInfrastructure
    = path.startsWith('/preview/') || path.startsWith('/_sanity/')

  if (!isApiRoute && !isStaticAsset)
    setResponseHeader(event, 'Netlify-Vary', 'cookie=sanity-preview-id')

  const config = useRuntimeConfig(event)
  const previewModeId = config.sanity?.visualEditing?.previewModeId
  const isPreview = Boolean(
    previewModeId && cookies['sanity-preview-id'] === previewModeId,
  )

  if (!isPreview && !isSanityInfrastructure)
    return

  setNoStore(event)
  event.context.nitro = event.context.nitro ?? {}
  event.context.nitro.noCache = true
})
```

Use `Netlify-Vary: cookie=sanity-preview-id`, not broad `Vary: Cookie`. Do not vary public API routes
by cookies; the preview branch uses the module proxy instead of `/api/sanity/*`.

Also opt the module infrastructure out of ISR and indexing:

```ts
routeRules: {
  '/preview/**': {
    isr: false,
    robots: false,
    headers: { 'cache-control': 'no-store' },
  },
  '/_sanity/**': {
    isr: false,
    robots: false,
    headers: { 'cache-control': 'no-store' },
  },
},
```

## Preview queries

Use `useSanityQuery` in the preview branch. In the default `live-visual-editing` mode, the module
forwards browser queries through the authenticated proxy and coordinates live updates with
Presentation.

Pass reactive getters for route and locale values. Plain object snapshots do not update when Nuxt
reuses a page component for a different route.

## Stega safety

Stega metadata is required for click-to-edit overlays but must not leak into public cached responses.

- Pass `{ stega: false }` to public server-route fetches.
- Use `stegaClean()` before comparisons, lookup keys, URLs, classes, IDs, and other semantic uses of
  strings returned by preview queries.
- Do not strip stega from visible preview text that needs overlay attribution.

```ts
import { stegaClean } from '@sanity/client/stega'

const category = computed(() => stegaClean(article.value?.category))
```

## Presentation configuration

Point the Studio Presentation tool at the module's native routes:

```ts
presentationTool({
  previewUrl: {
    origin: process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:3000',
    previewMode: {
      enable: '/preview/enable',
      disable: '/preview/disable',
    },
  },
})
```

Add the application origins required by the project to Sanity CORS. Enable credentials only when the
chosen client flow actually sends credentials directly to Sanity; the standard module preview proxy
keeps the Viewer token server-side.

## Verification

- A public request has `Netlify-Vary: cookie=sanity-preview-id` and remains cacheable.
- A valid preview request has both browser and Netlify no-store headers.
- A forged or arbitrary preview cookie does not bypass caching or unlock the proxy.
- `/preview/**` and `/_sanity/**` are no-store and noindex.
- Draft edits update through Presentation while public visitors continue receiving published data.
- Public endpoint responses contain no stega metadata or authorization token.

## Docs

- Nuxt Sanity visual editing: https://sanity.nuxtjs.org/getting-started/visual-editing
- Sanity Presentation: https://www.sanity.io/docs/presentation
- Netlify cache variation: https://docs.netlify.com/build/caching/caching-overview/
