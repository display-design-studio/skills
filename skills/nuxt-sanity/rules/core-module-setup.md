# Module Setup and Configuration

## Installation

```bash
npx nuxi module add @nuxtjs/sanity
```

Install `@sanity/client` explicitly when using visual editing; the module's minimal client is not
compatible with visual editing or live content.

## Published-content configuration

Keep public reads anonymous and enable the Sanity API CDN. Pin an API version that has been tested
with the application; never compute it from the current date at runtime.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sanity'],

  sanity: {
    projectId: process.env.NUXT_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2026-03-10',
    perspective: 'published',
    useCdn: true,
  },
})
```

The module exposes the project, dataset, API version, perspective, and CDN setting to the browser as
needed. Do not put a general read token in the public module configuration.

## Visual-editing configuration

Visual editing needs a Viewer token so the module's private preview proxy can read drafts. Configure
the token only under `sanity.visualEditing`; the module stores it in private runtime configuration
and does not expose it to the browser.

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

```env
NUXT_SANITY_PROJECT_ID=your-project-id
NUXT_SANITY_VISUAL_EDITING_TOKEN=sk...
NUXT_SANITY_VISUAL_EDITING_STUDIO_URL=https://your-studio.sanity.studio
NUXT_SANITY_WEBHOOK_SECRET=replace-with-a-random-secret
```

Use the lowest-privilege Viewer token for preview. A mutation endpoint, if one is genuinely needed,
must use a separate token with only the additional permissions it requires.

## Choosing `useCdn`

| Scenario | Setting | Reason |
|---|---|---|
| Public end-user reads | `true` | Fast, scalable API-CDN reads |
| Freshness-critical server regeneration | `false` | Avoid an API-CDN propagation race after invalidation |
| Draft/visual editing | Module-managed | Preview uses the private proxy and live API |
| Authenticated published reads | Either | The API CDN supports them, but cache entries are segmented by token |

With the default `disableSmartCdn: false`, the module disables `useCdn` when Nuxt preview mode is
active. Setting `disableSmartCdn: true` disables that smart behavior and is rarely appropriate.

The Display Starter keeps `useCdn: true` for published reads. That is a scale-first, eventually
consistent choice; see `perf-cdn-caching.md` for the webhook race and the freshness-first alternative.

## Runtime tokens outside visual editing

Do not add `runtimeConfig.sanity.token` merely because a server route uses `useSanity()`. Anonymous
published routes should stay anonymous. If a request-specific token is required, set it in a
server-only Nuxt plugin with `useSanity().setToken(token)` or create a dedicated server-only client.

## Named clients

Use `additionalClients` for another project or dataset, not as a substitute for preview mode:

```ts
sanity: {
  projectId: process.env.NUXT_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2026-03-10',
  useCdn: true,
  additionalClients: {
    archive: {
      projectId: process.env.NUXT_SANITY_ARCHIVE_PROJECT_ID,
      dataset: 'archive',
    },
  },
},
```

Access it with `useSanity('archive')`.

## Docs

- Configuration: https://sanity.nuxtjs.org/getting-started/configuration
- Visual editing: https://sanity.nuxtjs.org/getting-started/visual-editing
- Sanity API CDN: https://www.sanity.io/docs/content-lake/api-cdn
- API versioning: https://www.sanity.io/docs/api-versioning
