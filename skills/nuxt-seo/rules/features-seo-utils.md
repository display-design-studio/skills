# SEO Utils — nuxt-seo-utils

## Why it matters

`nuxt-seo-utils` handles the "invisible" SEO plumbing that teams often overlook:
canonical URLs prevent duplicate-content penalties, breadcrumbs improve navigation
and enable rich results, favicon auto-detection eliminates manual link tags, and
automatic OG tags ensure every page has social meta even without explicit
`useSeoMeta` calls. It ships as part of `@nuxtjs/seo` and requires no extra
configuration to activate these defaults.

---

## Installation

Included automatically with `@nuxtjs/seo`. For standalone use:

```bash
npx nuxi module add nuxt-seo-utils
```

---

## Breadcrumbs — useBreadcrumbItems

`useBreadcrumbItems` generates a breadcrumb list from the current route path.
Items are automatically linked to Schema.org `BreadcrumbList` when `nuxt-schema-org`
is installed.

### Incorrect

```vue
<!-- ❌ manually maintained breadcrumb array — breaks on route renames -->
<script setup>
const crumbs = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/blog' },
  { label: 'My Post', to: '/blog/my-post' },
]
</script>
```

### Correct

```vue
<script setup>
const breadcrumbs = useBreadcrumbItems()
// Returns: [{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, ...]
// Labels are derived from route names; override via definePageMeta({ breadcrumb: 'Custom Label' })
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ol>
      <li v-for="item in breadcrumbs" :key="item.to">
        <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
      </li>
    </ol>
  </nav>
</template>
```

Override the label for a specific page:

```ts
// pages/blog/[slug].vue
definePageMeta({ breadcrumb: () => route.params.slug })
```

---

## Canonical URLs — automatic and configurable

The module adds a `<link rel="canonical">` to every page automatically, derived
from `site.url` + current path.

Configure normalization behavior in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  seoUtils: {
    // Lowercase all canonical URLs (prevents duplicate content from mixed-case routes)
    canonicalLowercase: true,

    // Strip query params except these from canonical (analytics params excluded by default)
    canonicalQueryWhitelist: ['page', 'sort'],
  },
})
```

---

## Favicon auto-detection

Place a favicon in `public/` — the module detects it and injects the appropriate
`<link>` tags automatically. No manual `app.head` config needed.

Supported files (detected in priority order):
- `public/favicon.svg` → preferred (scales to any size)
- `public/favicon.ico` → fallback for legacy browsers
- `public/apple-touch-icon.png` → iOS home screen icon

---

## Automatic OG tags

When a page sets `title` or `description` via `useSeoMeta` but does not explicitly
set `ogTitle` or `ogDescription`, the module fills them in automatically:

```ts
// pages/about.vue
useSeoMeta({
  title: 'About Us',
  description: 'Learn about our team.',
  // ✅ ogTitle and ogDescription are set automatically from above
})
```

---

## Meta validation

In dev mode, the module warns in the console when:
- `og:image` is a relative URL (must be absolute for social platforms)
- `og:description` exceeds recommended character limits
- `<title>` is missing on a page

---

## Official docs

- Installation: https://nuxtseo.com/seo-utils/getting-started/installation
- useBreadcrumbItems: https://nuxtseo.com/seo-utils/api/use-breadcrumb-items
- Canonical URLs: https://nuxtseo.com/seo-utils/guides/canonical-urls
- Favicon: https://nuxtseo.com/seo-utils/guides/favicon
