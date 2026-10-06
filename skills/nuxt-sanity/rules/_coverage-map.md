# Nuxt + Sanity Coverage Map

Primary module source: https://github.com/nuxt-modules/sanity
Module documentation: https://sanity.nuxtjs.org/

## Core module integration

- Installation and runtime configuration
  - https://sanity.nuxtjs.org/getting-started/installation
  - https://sanity.nuxtjs.org/getting-started/configuration
  - `core-module-setup.md`
- `useSanityQuery`, `useLazySanityQuery`, and `useSanity`
  - https://sanity.nuxtjs.org/getting-started/usage
  - https://sanity.nuxtjs.org/composables/use-sanity-query
  - `core-composables.md`
- Nitro server usage and `validateSanityQuery`
  - https://sanity.nuxtjs.org/server
  - `core-server-routes.md`
- Visual editing, native preview routes, token privacy, and live updates
  - https://sanity.nuxtjs.org/getting-started/visual-editing
  - `features-visual-editing.md`

## Display Starter architecture

Source: Display Nuxt Starter, reviewed against its Nuxt 4 and `@nuxtjs/sanity@2.5.0` implementation.

- Public server route versus Presentation preview data flow
- Shared GROQ queries and `#sanity-types` fallback alias
- Validated locale/slug transport parameters
- Success-only caching and no-store error paths
- Reactive `MaybeRef` preview-switch composables
- Page and JSON dependency tags
- Signed POST webhook invalidation

Covered by `arch-starter-pattern.md` and `arch-extension-pattern.md`.

## Cache and consistency

- Netlify targeted cache headers, durable caching, cache variation, tags, and purge
  - https://docs.netlify.com/build/caching/caching-overview/
  - https://docs.netlify.com/build/functions/api/#purgecache
- Sanity API CDN behavior and live-API alternative
  - https://www.sanity.io/docs/content-lake/api-cdn
- Sanity webhook authenticity, delivery, retries, delete events, and recovery
  - https://www.sanity.io/docs/content-lake/webhook-best-practices
  - https://www.sanity.io/docs/content-lake/webhooks
  - https://github.com/sanity-io/webhook-toolkit
- Nuxt async-data keys and client-state clearing
  - https://nuxt.com/docs/api/composables/use-async-data
  - https://nuxt.com/docs/api/utils/clear-nuxt-data

Covered by `perf-cdn-caching.md`, `perf-query-keys-and-caching.md`, and
`debug-common-errors.md`.

## Other features

- `SanityImage` and image URL building: `features-sanity-image.md`
- Portable Text through `SanityContent`: `features-sanity-content.md`
- Dynamic sitemap sources: `features-sitemap.md`
- i18n sitemap paths and stega-safe URLs: `features-sitemap-i18n.md`
- SEO metadata from Sanity: `features-seo-meta.md`

## Maintenance boundaries

- Keep generic GROQ optimization and schema design in `sanity-best-practices`.
- Keep generic Nuxt rendering guidance in the `nuxt` skill.
- Recheck module source when `@nuxtjs/sanity` changes preview, typegen, query-key, or proxy behavior.
- Recheck Netlify documentation when cache headers, ISR, variation, cache tags, or `purgeCache` change.
- Treat fixed provider TTLs and observed propagation timing as project choices, not Sanity guarantees.

Attribution: Display Studio, 2026. Starter-specific rules derive from the Display Nuxt Starter;
portable behavior is grounded in the official sources above.
