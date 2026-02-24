# Module Setup and Configuration

## Why it matters

Misconfigured module options — wrong `apiVersion`, missing `useCdn` flag, or tokens
hardcoded inline — cause runtime fetch failures, stale data, or security exposures.
Get the configuration right first; every composable and component depends on it.

---

## Installation

```bash
npx nuxi module add @nuxtjs/sanity
```

This adds the module to `nuxt.config.ts` automatically.

---

## Minimal nuxt.config.ts sanity block

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sanity'],

  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-01-01', // always explicit — never omit or use 'v1'
    useCdn: true,             // true for public reads; false for draft/visual editing
  },
})
```

---

## Environment variables

Use `runtimeConfig` to keep secrets out of the client bundle.

**Public values** (projectId, dataset) — safe to expose to the browser:

```ts
// nuxt.config.ts
runtimeConfig: {
  public: {
    sanityProjectId: process.env.SANITY_PROJECT_ID,
    sanityDataset: process.env.SANITY_DATASET || 'production',
  },
  // private — server only:
  sanity: {
    token: process.env.SANITY_API_READ_TOKEN,
  },
},
```

**Required env vars (.env):**
```env
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_API_READ_TOKEN=sk...   # server-only, never NUXT_PUBLIC_*
```

---

## useCdn flag

| Scenario | Setting |
|----------|---------|
| Public production reads | `useCdn: true` (faster, globally cached) |
| Draft mode / visual editing | `useCdn: false` (bypasses CDN cache) |
| Server routes with auth token | `useCdn: false` (required for authenticated requests) |

---

## Named clients (multiple datasets or projects)

```ts
// nuxt.config.ts
sanity: {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  additionalClients: {
    preview: {
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: 'staging',
      apiVersion: '2024-01-01',
      useCdn: false,
    },
  },
},
```

Access named client in composables: `useSanity('preview')`.

---

## Incorrect

```ts
// ❌ Hardcoded credentials + ambiguous apiVersion
sanity: {
  projectId: 'abc123',
  dataset: 'production',
  apiVersion: 'v1',           // 'v1' is deprecated and may break
  token: 'sk...',             // token in nuxt.config.ts ships to client bundle
},
```

## Correct

```ts
// ✅ Env vars + explicit ISO apiVersion + no token in config
sanity: {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
},
// token in runtimeConfig.sanity.token (private)
```

---

## Docs

- Module README: https://github.com/nuxt-modules/sanity
- Getting started: https://sanity.nuxtjs.org/getting-started/installation
- Sanity API versioning: https://www.sanity.io/docs/api-versioning
