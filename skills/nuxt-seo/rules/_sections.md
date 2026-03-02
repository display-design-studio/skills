# Nuxt SEO Rule Sections

This skill covers the full `@nuxtjs/seo` suite: site config, meta tags,
robots, sitemap, og-image, schema-org, seo-utils, link-checker, and llms.txt.
For Nuxt core patterns → load `nuxt`.

## 1) Core (`core-`)

Start here for any nuxt-seo task:

- `core-site-config.md` — install @nuxtjs/seo meta-package, shared site.url / site.name / site.description, env-based config via NUXT_PUBLIC_SITE_URL
- `core-meta-tags.md` — useSeoMeta (type-safe OG/Twitter tags), useHead (title/link/script), app.head global defaults, titleTemplate, template components
- `core-robots-setup.md` — install @nuxtjs/robots, nuxt.config.ts robots block, disallow, blockNonSeoBots, blockAiBots, env-based indexing

## 2) Features (`features-`)

Load when working with a specific module or scenario:

- `features-sitemap.md` — @nuxtjs/sitemap auto-generation, dynamic URLs via server handler, exclude/include, i18n, multi-sitemap, debug
- `features-og-image.md` — nuxt-og-image install, defineOgImage composable, Vue template structure, renderer comparison, prerendering
- `features-schema-org.md` — nuxt-schema-org install, identity config, useSchemaOrg composable, schema types, debug endpoint
- `features-seo-utils.md` — useBreadcrumbItems, canonical URL automation, favicon auto-detection, automatic OG tags, meta validation
- `features-link-checker.md` — install nuxt-link-checker, dev DevTools usage, CI config, inspection rules, exclusion patterns, reports
- `features-page-control.md` — definePageMeta robots, route rules, useRobotsRule composable, X-Robots-Tag vs meta tag
- `features-llms-txt.md` — llms.txt standard, manual public/ file, nuxtseo.com docs for AI tools

## Suggested reading order

1. `core-site-config.md` (always first — sets up shared config used by all modules)
2. `core-meta-tags.md` (foundational meta tags before adding module-specific features)
3. `core-robots-setup.md` (crawl control baseline)
4. `features-sitemap.md` for sitemap generation
5. `features-og-image.md` for social share images
6. `features-schema-org.md` for structured data
7. `features-seo-utils.md` for breadcrumbs, canonical, favicon
8. `features-link-checker.md` for QA / CI integration
9. `features-page-control.md` for per-page robot control
10. `features-llms-txt.md` if llms.txt is needed
