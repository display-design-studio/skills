# Site Config — @nuxtjs/seo Meta-Package

## Why it matters

The `@nuxtjs/seo` meta-package installs all six SEO modules at once and provides
a **shared site config** (`site.url`, `site.name`, `site.description`) that every
module reads automatically. Without it, each module needs its base URL configured
separately — leading to drift, broken og:image URLs, and incorrect sitemap entries.

---

## Installation

```bash
npx nuxi module add @nuxtjs/seo
```

This installs and registers: `@nuxtjs/sitemap`, `nuxt-og-image`, `nuxt-schema-org`,
`nuxt-seo-utils`, `nuxt-link-checker`, and `@nuxtjs/robots`.

---

## Incorrect

```ts
// nuxt.config.ts — no shared site config
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  // ❌ modules cannot resolve the base URL for sitemap entries,
  //    og:image absolute URLs, or Schema.org identifiers
})
```

---

## Correct

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],

  site: {
    url: 'https://example.com',        // required: absolute URL, no trailing slash
    name: 'My Site',                   // used as og:site_name, Schema.org name
    description: 'A great website.',   // used as default og:description fallback
    defaultLocale: 'en',               // used by i18n-aware modules
  },
})
```

---

## Environment-based URL config

Override `site.url` per environment without changing code. Set the variable on
the hosting platform (Vercel, Netlify, etc.):

```bash
NUXT_PUBLIC_SITE_URL=https://staging.example.com
```

The `site` config is exposed under `useRuntimeConfig().public.site`, so all
modules pick up the override automatically at runtime.

---

## How downstream modules use site config

| Module | Uses site config for |
|--------|---------------------|
| `@nuxtjs/sitemap` | Base URL of every sitemap entry |
| `nuxt-og-image` | Absolute URL in og:image meta tag |
| `nuxt-schema-org` | `url` in WebSite / Organization identity |
| `nuxt-seo-utils` | Canonical URL construction |
| `@nuxtjs/robots` | Sitemap URL in robots.txt |

---

## Verification

1. Run `nuxt dev` and open `/__site-config__/debug.json` to inspect resolved values.
2. Confirm `url` matches the production domain before deploying.
3. Check that `NUXT_PUBLIC_SITE_URL` is set on every non-production environment.

---

## Official docs

- Installation: https://nuxtseo.com/nuxt-seo/getting-started/installation
- Site config guide: https://nuxtseo.com/site-config/getting-started/what-is-site-config
- Setting site config: https://nuxtseo.com/site-config/guides/setting-site-config
