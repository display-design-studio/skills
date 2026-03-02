# OG Image — nuxt-og-image

## Why it matters

Social platforms (Twitter/X, LinkedIn, Slack, iMessage) preview links using the
`og:image` meta tag. Without dynamic OG images, every page shares the same static
image, reducing click-through rates. `nuxt-og-image` generates per-page images
at build time or on-demand, using Vue component templates — no headless browser
required with Takumi renderer.

---

## Installation

```bash
npx nuxi module add nuxt-og-image
```

Requires `site.url` to be set — og:image must be an absolute URL (see `core-site-config.md`).

---

## Incorrect

```ts
// pages/blog/[slug].vue
// ❌ hardcoded static image — every post shares the same og:image
useSeoMeta({
  ogImage: '/og-default.png',  // relative URL also fails — must be absolute
})
```

---

## Correct — using defineOgImage

```ts
// pages/blog/[slug].vue
const { data: post } = await useAsyncData(() => fetchPost(route.params.slug))

defineOgImage({
  component: 'BlogPost',   // references components/OgImage/BlogPost.takumi.vue
  props: {
    title: post.value.title,
    category: post.value.category,
    date: post.value.publishedAt,
  },
})
```

---

## Vue template structure

OG image templates live in `components/OgImage/` and use a renderer-specific
file suffix. With Takumi (recommended):

```vue
<!-- components/OgImage/BlogPost.takumi.vue -->
<template>
  <div class="w-full h-full bg-white flex flex-col justify-between p-12">
    <div class="text-sm text-gray-500 uppercase tracking-wide">{{ category }}</div>
    <div>
      <h1 class="text-5xl font-bold text-gray-900 leading-tight">{{ title }}</h1>
      <p class="mt-4 text-xl text-gray-500">{{ date }}</p>
    </div>
    <div class="flex items-center gap-3">
      <img src="/logo.svg" class="h-8" />
      <span class="text-gray-700 font-medium">example.com</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  category: string
  date: string
}>()
</script>
```

---

## Renderer comparison

| Renderer | Format | Runtime required | Best for |
|----------|--------|-----------------|---------|
| Takumi (recommended) | `.takumi.vue` | None (WASM) | SSR + prerender, no server deps |
| Satori | `.vue` | None (WASM) | Flex-layout only templates |
| Browser | `.vue` | Chrome/Playwright | Complex CSS, gradients, web fonts |

Takumi supports full CSS (including grid) and is the recommended default.

---

## Prerendering (zero runtime)

For statically generated sites, set `zeroRuntime: true` to prerender all OG images
at build time — no server computation needed at runtime:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ogImage: {
    zeroRuntime: true,   // prerender all og:image at build time
  },
})
```

---

## Preview in DevTools

Open **Nuxt DevTools** → **OG Image** tab to preview and iterate on templates
without deploying. Changes hot-reload instantly.

---

## Official docs

- Installation: https://nuxtseo.com/og-image/getting-started/installation
- defineOgImage API: https://nuxtseo.com/og-image/api/define-og-image
- Custom templates: https://nuxtseo.com/og-image/guides/custom-templates
- Choosing a renderer: https://nuxtseo.com/og-image/getting-started/choosing-a-renderer
