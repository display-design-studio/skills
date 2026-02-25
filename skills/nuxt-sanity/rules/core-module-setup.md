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

Use Nuxt's `runtimeConfig` to keep secrets out of the client bundle. Nuxt auto-maps env vars to `runtimeConfig` at runtime (not build-time) using the `NUXT_*` / `NUXT_PUBLIC_*` prefix convention — no `process.env.*` needed in the config.

**Public values** (projectId, dataset) — safe to expose to the browser:

```ts
// nuxt.config.ts
runtimeConfig: {
  public: {
    sanityProjectId: '',   // set via NUXT_PUBLIC_SANITY_PROJECT_ID
    sanityDataset: 'production',  // override via NUXT_PUBLIC_SANITY_DATASET
  },
  // private — server only, never exposed to client:
  sanity: {
    token: '',   // set via NUXT_SANITY_TOKEN
  },
},
```

**Required env vars (.env):**
```env
NUXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NUXT_PUBLIC_SANITY_DATASET=production
NUXT_SANITY_TOKEN=sk...   # server-only — NEVER use NUXT_PUBLIC_SANITY_TOKEN
```

Nuxt resolves `NUXT_PUBLIC_*` → `runtimeConfig.public.*` and `NUXT_*` → `runtimeConfig.*` automatically at runtime, making it safe to change the token in deployment without a rebuild.

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
