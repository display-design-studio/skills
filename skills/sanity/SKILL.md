---
name: sanity
description: >-
  Sanity CMS best practices in one skill: schema design, GROQ, TypeGen, Visual Editing, images, Portable Text, Studio
  structure, localization, migrations, Functions, webhooks and framework integrations (Next.js, Nuxt, Astro, Remix,
  SvelteKit, Angular, Hydrogen, App SDK); content modeling (reuse, references vs embedding, taxonomies); SEO and AEO
  (metadata, Open Graph, sitemaps, hreflang, JSON-LD, EEAT, AI answer surfaces); content experimentation (A/B tests,
  metrics, statistics, CMS-managed variants).
  Use when the user writes or reviews Sanity schemas, GROQ, Studio config or frontend integration, models content for
  a Sanity project, or adds SEO or A/B testing to Sanity-backed sites.
  Keywords: sanity, groq, schema, studio, typegen, portable text, content modeling, seo, aeo, experimentation.
  For Nuxt + @nuxtjs/sanity use nuxt-sanity; for the schema generator use sanity-schema-accelerator.
license: MIT
metadata:
  author: display studio
---

# Sanity

One entry point for Sanity topics. Topic guides live in `references/`; read the one that fits before writing code.
Each guide may point to deeper files in `references/<topic>/references/`.

## How to use

1. Pick the topic whose "use it when" cell fits the request. Usually one; two are fine (e.g. `sanity-best-practices`
   + `content-modeling-best-practices`).
2. Read `references/<topic>.md` first, then only the deeper files it points to.
3. Related skills: `nuxt-sanity` (`@nuxtjs/sanity` module), `sanity-schema-accelerator` (schema generator).

## Topics

<!-- BEGIN TOPICS -->
| topic | use it when |
| --- | --- |
| [`sanity-best-practices`](references/sanity-best-practices.md) | Sanity development best practices for schema design, GROQ queries, TypeGen, Visual Editing, images, Portable Text, Studio structure, localization, migrations, Sanity Functions, webhooks, Blueprints, and framework integrations such as Next.js, Nuxt, Astro, Remix, SvelteKit, Angular, Hydrogen, and the App SDK. Use this skill whenever working with Sanity schemas, defineType or defineField, GROQ or defineQuery, content modeling, Presentation or preview setups, Sanity-powered frontend integrations, event-driven content automation, documentEventHandler, defineDocumentFunction, defineMediaLibraryAssetFunction, @sanity/functions, @sanity/blueprints, sanity.blueprint.ts, event-driven content automation, or when reviewing and fixing a Sanity codebase. |
| [`content-modeling-best-practices`](references/content-modeling-best-practices.md) | Structured content modeling guidance for schema design, content architecture, content reuse, references versus embedded objects, separation of concerns, and taxonomies across Sanity and other headless CMSes. Use this skill when designing or refactoring content types, deciding field shapes, debating reusable versus nested content, planning omnichannel content models, or reviewing whether a schema is too page-shaped or presentation-driven. |
| [`seo-aeo-best-practices`](references/seo-aeo-best-practices.md) | SEO and AEO best practices for metadata, Open Graph, sitemaps, robots.txt, hreflang, JSON-LD structured data, EEAT, and content optimized for search engines and AI answer surfaces. Use this skill when implementing page SEO, technical SEO, schema markup, international SEO, AI-overview readiness, or improving content for Google, ChatGPT, Perplexity, and similar assistants. |
| [`content-experimentation-best-practices`](references/content-experimentation-best-practices.md) | Content experimentation and A/B testing guidance covering experiment design, hypotheses, metrics, sample size, statistical foundations, CMS-managed variants, and common analysis pitfalls. Use this skill when planning experiments, setting up variants, choosing success metrics, interpreting statistical results, or building experimentation workflows in a CMS or frontend stack. |
<!-- END TOPICS -->

## Source

`references/` is generated from `sanity-io/agent-toolkit` (MIT), vendored under `vendor/sanity-agent-toolkit`, by
`scripts/sync-vendored.mjs`. Do not edit it by hand. Upstream also ships `portable-text-conversion`,
`portable-text-serialization` and `sanity-migration`, not included here.
