# Nuxt + Sanity Rule Sections

This skill covers the `@nuxtjs/sanity` integration layer only.
For GROQ optimization → load `sanity-best-practices`.
For Nuxt core patterns → load `nuxt`.

## 1) Core (`core-`)

Start here for any nuxt-sanity task:

- `core-module-setup.md` — module install, nuxt.config.ts sanity block, env vars
- `core-composables.md` — useSanityQuery, useLazySanityQuery, useSanity
- `core-server-routes.md` — Nitro server routes, validateSanityQuery, private datasets

## 1.5) Starter Architecture (`arch-`)

Load when building with the Display Nuxt Starter or adding a new document type:

- `arch-starter-pattern.md` — directory layout, data-flow, GROQ conventions, i18n
- `arch-extension-pattern.md` — 4-step recipe: GROQ query → endpoint → composable → page

## 2) Features (`features-`)

Load when working with specific integration features:

- `features-sanity-image.md` — SanityImage component, @nuxt/image integration, useSanityImage
- `features-sanity-content.md` — SanityContent Portable Text renderer, custom block components
- `features-visual-editing.md` — stega, live preview, Presentation tool, draft mode toggling
- `features-sitemap.md` — dynamic sitemap sources, defineSitemapEventHandler, stegaClean on slugs
- `features-seo-meta.md` — useSeoMeta() pattern, GROQ seo fields, ogImage URL, fallback chain
- `features-sitemap-i18n.md` — i18n prefix_except_default strategy, per-locale loc building, stegaClean

## 3) Performance (`perf-`)

Load when dealing with caching or reactive data problems:

- `perf-query-keys-and-caching.md` — stable query keys, reactive params, cache busting
- `perf-cdn-caching.md` — two-layer CDN caching, preview bypass middleware, cache tagging, webhook invalidation

## 4) Debug (`debug-`)

Load when troubleshooting errors:

- `debug-common-errors.md` — CORS, auth tokens, hydration mismatches, undefined data

## Suggested reading order

1. `core-module-setup.md` (always first)
2. `core-composables.md` (data fetching foundation)
3. `arch-starter-pattern.md` + `arch-extension-pattern.md` (if using the Display Nuxt Starter)
4. Feature-specific rules for the task at hand
5. `perf-cdn-caching.md` if configuring CDN caching or webhook invalidation
6. `perf-query-keys-and-caching.md` if reactivity or query-level staleness issues arise
7. `debug-common-errors.md` when errors occur
