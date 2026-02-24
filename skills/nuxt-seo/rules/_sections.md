# Nuxt SEO Rule Sections

This skill covers `@nuxtjs/robots` and `llms.txt` integration.
For full SEO suite configuration → see https://nuxtseo.com.
For Nuxt core patterns → load `nuxt`.

## 1) Core (`core-`)

Start here for any nuxt-seo task:

- `core-robots-setup.md` — install, nuxt.config.ts robots block, disallow, blockNonSeoBots, blockAiBots, env-based indexing

## 2) Features (`features-`)

Load when working with specific controls:

- `features-page-control.md` — definePageMeta robots, route rules, useRobotsRule composable, X-Robots-Tag vs meta tag
- `features-llms-txt.md` — llms.txt standard, manual public/ file, nuxtseo.com docs for AI tools

## Suggested reading order

1. `core-robots-setup.md` (always first)
2. `features-page-control.md` for per-page or per-route control
3. `features-llms-txt.md` if llms.txt is needed
