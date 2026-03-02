# Schema.org — nuxt-schema-org

## Why it matters

Schema.org structured data (JSON-LD) tells Google what a page is about beyond
its text content. Without it, pages miss eligibility for rich results: FAQ
accordions, product prices, breadcrumb trails, article bylines, and local
business panels. `nuxt-schema-org` auto-generates `WebSite` and `WebPage`
nodes on every page, and provides composables for page-specific types.

---

## Installation

```bash
npx nuxi module add nuxt-schema-org
```

Requires `site.url` and `site.name` in `nuxt.config.ts` (see `core-site-config.md`).

---

## Incorrect

```vue
<!-- pages/about.vue -->
<!-- ❌ manual JSON-LD in useHead — error-prone, no type safety, no node linking -->
<script setup>
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage' }),
  }]
})
</script>
```

---

## Correct — identity config

Define your site identity once in `nuxt.config.ts`. This is used by all Schema.org
nodes across the site:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-schema-org'],

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'My Company',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
      sameAs: [
        'https://twitter.com/mycompany',
        'https://linkedin.com/company/mycompany',
      ],
    },
  },
})

// For personal/blog sites use type: 'Person' instead:
// identity: { type: 'Person', name: 'Jane Doe', url: 'https://janedoe.com' }
```

---

## useSchemaOrg composable

Call `useSchemaOrg()` in page components to add page-specific schema nodes.
Nodes are automatically linked to the site identity.

```ts
// pages/blog/[slug].vue
const { data: post } = await useAsyncData(...)

useSchemaOrg([
  defineArticle({
    headline: post.value.title,
    description: post.value.excerpt,
    image: post.value.coverImage,
    datePublished: post.value.publishedAt,
    dateModified: post.value.updatedAt,
    author: {
      type: 'Person',
      name: post.value.author.name,
    },
  }),
])
```

---

## Common schema types

| Type | Composable | Use case |
|------|-----------|---------|
| Article / BlogPosting | `defineArticle()` | Blog posts, news articles |
| Product | `defineProduct()` | E-commerce product pages |
| FAQPage | `defineFaqPage()` | FAQ sections (enables rich accordions) |
| LocalBusiness | `defineLocalBusiness()` | Physical locations |
| BreadcrumbList | auto via `nuxt-seo-utils` | Navigation trails |
| WebPage | auto on every page | Default page type |
| WebSite | auto on homepage | Site-level identity |

```ts
// pages/faq.vue
useSchemaOrg([
  defineFaqPage({
    mainEntity: [
      { name: 'What is your return policy?', acceptedAnswer: { text: '30 days, no questions asked.' } },
      { name: 'Do you ship internationally?', acceptedAnswer: { text: 'Yes, to 50+ countries.' } },
    ],
  }),
])
```

---

## Debug

Open `/__schema-org__/debug.json` in dev mode to inspect the full JSON-LD graph
and verify all nodes are correctly linked.

---

## Official docs

- Installation: https://nuxtseo.com/schema-org/getting-started/installation
- Identity config: https://nuxtseo.com/schema-org/guides/identity
- useSchemaOrg API: https://nuxtseo.com/schema-org/api/use-schema-org
- Schema types: https://nuxtseo.com/schema-org/guides/schema-types
- Debugging: https://nuxtseo.com/schema-org/guides/debugging
