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

## Features

- SanityImage + @nuxt/image: https://sanity.nuxtjs.org/components/sanity-image
  → `features-sanity-image.md`
- useSanityImage: https://sanity.nuxtjs.org/composables/use-sanity-image
  → `features-sanity-image.md`
- SanityContent (Portable Text): https://sanity.nuxtjs.org/components/sanity-content
  → `features-sanity-content.md`
- Visual editing / stega: https://sanity.nuxtjs.org/visual-editing
  → `features-visual-editing.md`

## Performance

- Query key reactivity / caching: https://sanity.nuxtjs.org/composables/use-sanity-query
  → `perf-query-keys-and-caching.md`

## Debug

- CORS, auth, hydration: common pitfalls from module issues tracker
  → `debug-common-errors.md`

## Notes

- TypeScript typegen is covered by `sanity-best-practices/rules/typegen-workflow.md` —
  link to it from composables rule rather than duplicating.
- GROQ query patterns belong in `sanity-best-practices`, not here.
- Attribution: Display Studio, 2026. Source: @nuxtjs/sanity module docs and GitHub issues.
