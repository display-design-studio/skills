# Display Nuxt Starter Architecture

This is an opinionated Netlify deployment pattern layered on `@nuxtjs/sanity`. For portable module
usage, start with the `core-*` rules.

## Directory layout

```text
shared/utils/           Exported GROQ queries shared by server and preview code
shared/types/           Fallback Sanity result types before Studio typegen exists
server/api/sanity/      Published-content endpoints
server/api/cache/       Signed Netlify invalidation endpoint
server/utils/           CDN headers, parameter validation, webhook validation
server/middleware/      Preview cache isolation
app/composables/        Public/preview switch and page no-store helper
app/pages/              SSR pages and page-level cache tags
```

## Data flow

```text
shared query
  -> public: page -> useFetch -> /api/sanity/* -> anonymous published Sanity read
  -> preview: page -> useSanityQuery -> module preview proxy -> live draft read
```

The public route and the rendered page are separate Netlify cache objects. Both must carry the same
document dependency tags so one webhook purge invalidates initial SSR and client navigation data.

## Cache layers

| Layer | Starter behavior |
|---|---|
| Browser | May store the response but must revalidate before reuse (`max-age=0`) |
| Netlify page HTML | ISR, 24-hour finite backstop, tagged |
| Netlify `/api/sanity/*` JSON | Durable 24-hour cache plus 1-hour SWR, tagged |
| Sanity API CDN | Enabled for anonymous published reads |
| Preview | No-store throughout; Sanity API CDN bypassed by the module |

There is no `defineCachedEventHandler` layer in front of Sanity. See `perf-cdn-caching.md`.

## GROQ query conventions

- Export queries from `shared/utils/` with `defineQuery`.
- Import `defineQuery` explicitly from `groq`.
- Pass request values as `$parameters`; never interpolate them into query text.
- Project `_id` and `_type` for cache tagging.
- Project IDs/types of referenced documents whose fields are rendered so those dependencies can be
  tagged too.

```ts
import { defineQuery } from 'groq'

export const pageQuery = defineQuery(`
  *[_type == "page" && language == $lang && slug[$lang].current == $slug][0] {
    ...,
    _id,
    _type,
    client->{ _id, _type, name }
  }
`)
```

## i18n conventions

The starter uses `prefix_except_default`, default locale `en`, URL query parameter `lang`, and GROQ
parameter `$lang`. `SUPPORTED_LOCALES` in the server validator must match the Nuxt i18n locale list.
Reject unsupported or array-valued locale parameters rather than falling back silently.

## Type generation

The starter uses Sanity CLI typegen from a sibling `studio/` project and exposes the generated file
through `#sanity-types`. A checked-in fallback module keeps the Nuxt app typecheckable before Studio
is initialized.

```ts
import type { PageQueryResult } from '#sanity-types'
```

Projects using the module's native typegen should import its generated query result types instead.
Do not document both mechanisms as simultaneously required.

## Response invariants

- Set no-store before parsing or fetching.
- Validate every request parameter.
- Return 400 for invalid input, 404 for missing content, and 502 for an upstream Sanity failure.
- Enable public CDN headers only after a valid document was fetched.
- Do not tag or cache preview, error, or not-found responses.
- On pages, call `useNoStore()` before throwing and call `useCacheTag()` only after valid data exists.

## Cross-references

- Adding a document type: `arch-extension-pattern.md`
- Preview behavior: `features-visual-editing.md`
- Cache and webhook behavior: `perf-cdn-caching.md`
