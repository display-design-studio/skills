# Nuxt + Sanity Coverage Map

Module source: https://github.com/nuxt-modules/sanity
Docs: https://sanity.nuxtjs.org/

## Core

- Module installation / config: https://sanity.nuxtjs.org/getting-started/installation
  → `core-module-setup.md`
- useSanityQuery, useLazySanityQuery: https://sanity.nuxtjs.org/composables/use-sanity-query
  → `core-composables.md`
- useSanity (raw client): https://sanity.nuxtjs.org/composables/use-sanity
  → `core-composables.md`, `core-server-routes.md`
- Nitro server usage + validateSanityQuery: https://sanity.nuxtjs.org/server
  → `core-server-routes.md`

## Starter Architecture

> Source: Display Nuxt Starter developer guide (Display Studio, internal)

- Directory layout, data-flow (query → endpoint → composable → page)
  → `arch-starter-pattern.md`
- GROQ query conventions (`$lang`, `$slug`, `defineQuery`, auto-import)
  → `arch-starter-pattern.md`
- i18n conventions (default `en`, `lang` param, `$lang` in GROQ, locale files)
  → `arch-starter-pattern.md`
- TypeScript typegen imports from `#build/types/sanity-typegen`
  → `arch-starter-pattern.md`
- 4-step recipe: GROQ query → `defineCachedEventHandler` endpoint → preview-switch composable → page
  → `arch-extension-pattern.md`
- Slug-parameterised variant (`<type>:<lang>:<slug>` cache key)
  → `arch-extension-pattern.md`

## Features

- SanityImage + @nuxt/image: https://sanity.nuxtjs.org/components/sanity-image
  → `features-sanity-image.md`
- useSanityImage: https://sanity.nuxtjs.org/composables/use-sanity-image
  → `features-sanity-image.md`
- SanityContent (Portable Text): https://sanity.nuxtjs.org/components/sanity-content
  → `features-sanity-content.md`
- Visual editing / stega: https://sanity.nuxtjs.org/visual-editing
  → `features-visual-editing.md`
- Dynamic sitemap sources + defineSitemapEventHandler: https://nuxtseo.com/sitemap/guides/dynamic-urls
  → `features-sitemap.md`

## Performance

- Query key reactivity / caching: https://sanity.nuxtjs.org/composables/use-sanity-query
  → `perf-query-keys-and-caching.md`
- Two-layer HTTP/CDN caching (Browser + Netlify), `routeRules`, preview bypass middleware
  → `perf-cdn-caching.md` (source: Display Nuxt Starter + @netlify/functions)
- Cache tagging (`Netlify-Cache-Tag`), `useCacheTag` composable, surgical CDN purge
  → `perf-cdn-caching.md`
- Webhook-driven cache invalidation (`POST /api/cache/revalidate`), manual purge (`POST /api/cache/purge`)
  → `perf-cdn-caching.md`

## Debug

- CORS, auth, hydration: common pitfalls from module issues tracker
  → `debug-common-errors.md`

## Notes

- TypeScript typegen is covered by `sanity-best-practices/rules/typegen-workflow.md` —
  link to it from composables rule rather than duplicating.
- GROQ query patterns belong in `sanity-best-practices`, not here.
- Attribution: Display Studio, 2026. Source: @nuxtjs/sanity module docs and GitHub issues.
- Starter architecture content (arch-* files, perf-cdn-caching.md): Display Studio internal
  developer guide for the Display Nuxt Starter project, 2026.
