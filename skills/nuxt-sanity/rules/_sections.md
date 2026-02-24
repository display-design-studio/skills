# Nuxt + Sanity Rule Sections

This skill covers the `@nuxtjs/sanity` integration layer only.
For GROQ optimization → load `sanity-best-practices`.
For Nuxt core patterns → load `nuxt`.

## 1) Core (`core-`)

Start here for any nuxt-sanity task:

- `core-module-setup.md` — module install, nuxt.config.ts sanity block, env vars
- `core-composables.md` — useSanityQuery, useLazySanityQuery, useSanity
- `core-server-routes.md` — Nitro server routes, validateSanityQuery, private datasets

## 2) Features (`features-`)

Load when working with specific integration features:

- `features-sanity-image.md` — SanityImage component, @nuxt/image integration, useSanityImage
- `features-sanity-content.md` — SanityContent Portable Text renderer, custom block components
- `features-visual-editing.md` — stega, live preview, Presentation tool, draft mode toggling

## 3) Performance (`perf-`)

Load when dealing with caching or reactive data problems:

- `perf-query-keys-and-caching.md` — stable query keys, reactive params, cache busting

## 4) Debug (`debug-`)

Load when troubleshooting errors:

- `debug-common-errors.md` — CORS, auth tokens, hydration mismatches, undefined data

## Suggested reading order

1. `core-module-setup.md` (always first)
2. `core-composables.md` (data fetching foundation)
3. Feature-specific rules for the task at hand
4. `perf-query-keys-and-caching.md` if reactivity or staleness issues arise
5. `debug-common-errors.md` when errors occur
