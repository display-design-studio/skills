# Robots Setup and Configuration

## Why it matters

Without `@nuxtjs/robots`, every route of a Nuxt app is crawlable by default with no
control over bots. Misconfiguring (or skipping) the module lets AI scrapers, SEO-hostile
bots, and staging environments get indexed, degrading SEO and privacy.

---

## Installation

```bash
npx nuxi module add @nuxtjs/robots
```

This adds `@nuxtjs/robots` to `nuxt.config.ts` automatically.

---

## Incorrect

```ts
// nuxt.config.ts — no robots configuration
export default defineNuxtConfig({
  modules: ['@nuxtjs/robots'],
  // ❌ no robots config: staging/preview envs may be publicly indexed,
  //    AI bots are not blocked, non-SEO bots crawl freely
})
```

---

## Correct

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/robots'],

  robots: {
    // Disallow specific paths globally
    disallow: ['/admin', '/api'],

    // Block common non-SEO bots (scrapers, spam bots)
    blockNonSeoBots: true,

    // Block known AI training bots (GPTBot, CCBot, etc.)
    blockAiBots: true,
  },
})
```

---

## Default behavior

| Environment | Default |
|-------------|---------|
| Development (`dev: true`) | All bots blocked (`Disallow: /`) |
| Production | All bots allowed — you must configure disallow rules explicitly |

The module reads `process.env.NODE_ENV` automatically. No manual env check needed for
dev/prod distinction.

---

## Environment-based indexing

To block indexing on staging/preview deployments without changing code, set the
`NUXT_SITE_ENV` environment variable on the hosting platform:

```bash
NUXT_SITE_ENV=staging
```

When `NUXT_SITE_ENV` is not `production`, the module renders `Disallow: /` regardless
of the `robots` config block, preventing staging content from appearing in search results.

---

## Verification

1. Run `nuxt dev` and open `/robots.txt` in the browser — should show `Disallow: /`.
2. In production build, open `/robots.txt` and verify only intended paths are disallowed.
3. Use **Nuxt DevTools** → SEO panel to inspect the active robots rules per page.

---

## Official docs

- Installation: https://nuxtseo.com/robots/getting-started/installation
- Config API: https://nuxtseo.com/robots/api/config
- Disable indexing guide: https://nuxtseo.com/robots/guides/disable-indexing
