# Link Checker — nuxt-link-checker

## Why it matters

Broken internal links create a poor user experience and signal poor site quality
to search engines. `nuxt-link-checker` inspects all links at dev time (via DevTools)
and optionally at build time (CI), catching broken links, SEO anti-patterns, and
accessibility issues before they reach production.

---

## Installation

```bash
npx nuxi module add nuxt-link-checker
```

---

## Incorrect

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-link-checker'],
  // ❌ no CI integration — broken links only caught manually in dev, not in deploy pipeline
  // ❌ no exclusions — third-party links that are legitimately slow cause false positives
})
```

---

## Correct

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-link-checker'],

  linkChecker: {
    // Block the build if broken links are found (CI/CD integration)
    failOnError: true,

    // Run the checker as part of nuxt build / nuxt generate
    runOnBuild: true,

    // Exclude specific links from inspection
    excludeLinks: [
      'https://internal-staging.example.com/**',  // wildcard
      '/admin/**',                                 // internal path pattern
    ],
  },
})
```

---

## Dev usage — DevTools

In development, open **Nuxt DevTools** → **Link Checker** tab to see a real-time
report of all link issues on the current page. Issues are grouped by inspection rule.

---

## Inspection rules (13 total)

| Category | Rules |
|----------|-------|
| Broken links | 404 responses, DNS errors, redirect loops |
| SEO | Links with `nofollow` that shouldn't have it, missing anchor text |
| URL structure | Trailing slashes inconsistency, uppercase in URLs |
| Accessibility | Empty anchor text, `href="#"` without aria-label |

---

## CI integration

For automated pipelines, run the link checker as a separate build step:

```bash
# package.json script
"check:links": "nuxt build && nuxt-link-checker"
```

With `failOnError: true`, the command exits with a non-zero code on broken links,
preventing deployment via CI/CD (GitHub Actions, Vercel, Netlify).

---

## Reports

The checker outputs a report in the format of your choice:

```ts
linkChecker: {
  report: {
    html: true,     // link-checker-report.html
    markdown: true, // link-checker-report.md
    json: true,     // link-checker-report.json
  },
}
```

---

## Exclusion patterns

| Pattern type | Example |
|-------------|---------|
| Exact URL | `'https://twitter.com/myhandle'` |
| Wildcard | `'https://example.com/docs/**'` |
| Regex | `'/regex:^https:\\/\\/old\\.example\\.com/'` |

---

## Official docs

- Installation: https://nuxtseo.com/link-checker/getting-started/installation
- CI integration: https://nuxtseo.com/link-checker/guides/ci
- Inspection rules: https://nuxtseo.com/link-checker/guides/inspection-rules
- Excluding links: https://nuxtseo.com/link-checker/guides/excluding-links
