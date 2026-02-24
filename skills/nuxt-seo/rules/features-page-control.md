# Per-Page and Runtime Crawl Control

## Why it matters

Global `disallow` rules in `nuxt.config.ts` are too coarse for user-generated content,
private profiles, or admin pages that must be excluded individually. The module provides
three mechanisms for per-page control, each serving a different use case.

---

## 1) `definePageMeta({ robots: false })` — single-page noindex

The simplest way to mark a single page as non-indexable.

### Incorrect

```ts
// pages/admin.vue
// ❌ nothing — page is publicly indexed
```

### Correct

```ts
// pages/admin.vue
<script setup>
definePageMeta({
  robots: false, // renders <meta name="robots" content="noindex, nofollow">
})
</script>
```

---

## 2) Route rules — pattern-based blocking

Block a whole section of routes without modifying each page file.

### Incorrect

```ts
// nuxt.config.ts — repeated definePageMeta in every preview page
```

### Correct

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/preview/**': { robots: false },
    '/account/settings/**': { robots: 'noindex' },
  },
})
```

---

## 3) `useRobotsRule()` composable — reactive runtime control

Use when the robots rule must change based on runtime state (e.g., a user's profile
is private, a draft post is unpublished).

### Incorrect

```ts
// Trying to conditionally call definePageMeta — not reactive, runs at build time
if (profile.isPrivate) {
  definePageMeta({ robots: false }) // ❌ won't work at runtime
}
```

### Correct

```ts
// pages/profile/[id].vue
<script setup>
const { data: profile } = await useFetch(`/api/profile/${route.params.id}`)

useRobotsRule(computed(() => profile.value?.isPrivate ? false : true))
// Dynamically adds/removes noindex based on profile visibility
</script>
```

---

## X-Robots-Tag header vs `<meta name="robots">`

| Mechanism | When used |
|-----------|-----------|
| `<meta name="robots">` | HTML pages rendered by Nuxt (default for `definePageMeta`) |
| `X-Robots-Tag` HTTP header | Non-HTML responses (API routes, PDFs, images) |

`@nuxtjs/robots` automatically uses `X-Robots-Tag` for server routes and `<meta>` for
page components — no manual configuration needed.

---

## Official docs

- definePageMeta robots: https://nuxtseo.com/robots/api/define-page-meta
- Route rules: https://nuxtseo.com/robots/guides/route-rules
- useRobotsRule composable: https://nuxtseo.com/robots/api/use-robots-rule
- Headers guide: https://nuxtseo.com/robots/guides/headers
