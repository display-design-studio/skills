# Common Errors and Debug Patterns

## Preview does not enable

Check, in order:

1. `sanity.visualEditing.token` and `studioUrl` were available when Nuxt built.
2. Presentation points to `/preview/enable` and `/preview/disable`.
3. The enable request succeeds and sets `sanity-preview-id`.
4. The cookie value equals the private `runtimeConfig.sanity.visualEditing.previewModeId` on the
   server; cookie presence alone is insufficient.
5. `/preview/**` and `/_sanity/**` are no-store and not intercepted by page ISR.

Do not log the token or private preview-mode ID.

## Draft content is missing

- Confirm the page selected the `useSanityQuery` branch during SSR.
- Confirm the module is not configured with `minimal: true`.
- Confirm the Viewer token can read drafts.
- Inspect `useSanityPerspective()` if the query still resolves to `published`.
- Confirm the Presentation iframe uses the same application origin that enabled preview.

## Public content contains stega metadata

Public routes must pass `{ stega: false }` and preview data must never flow through the public
Netlify-cached endpoint. Purge any already-cached contaminated response after fixing the route.

## Hydration mismatch

Server and client must choose the same public or preview branch. Base preview authorization on the
module state established from its validated cookie, not on client-only URL checks or arbitrary
cookies. Also check that route/locale parameters resolve to identical values during SSR and hydration.

## `useSanity` is undefined in a server route

`@nuxtjs/sanity` auto-imports `useSanity` for Nitro. If generated imports are stale, run Nuxt prepare
and confirm the module is enabled. An explicit fallback import is:

```ts
import { useSanity } from '#imports'
```

Do not import the composable directly from the package root.

## `validateSanityQuery` breaks `client.fetch`

This is incorrect:

```ts
const query = validateSanityQuery(body.query)
return client.fetch(query) // query is Promise<boolean>
```

Validate, then fetch the original allowlisted string:

```ts
await validateSanityQuery(body.query)
return client.fetch(body.query, body.params ?? {})
```

## CORS failure

Add only the application and Studio origins that need direct Sanity access. Enable credentials only
for flows that actually use credentialed browser requests. The standard visual-editing proxy keeps
the Viewer token server-side, so do not expose a token merely to work around CORS.

## Token appears in browser state or network requests

- Remove it from `runtimeConfig.public` and public `sanity.token` configuration.
- Put the preview token under `sanity.visualEditing.token`.
- Use a server-only client or plugin for any unrelated authenticated operation.
- Rotate the leaked token and reduce its permissions; removing it from source does not revoke it.

## Stale content after publish

Do not assume one cache layer. Compare:

1. Sanity live API response.
2. Sanity API-CDN response.
3. `/api/sanity/*` JSON response.
4. Page HTML response.
5. Nuxt payload/client navigation state.

| Observation | Likely cause |
|---|---|
| Live API fresh, Sanity API CDN stale | Sanity propagation race; use live API for freshness-critical regeneration |
| Sanity fresh, JSON stale | Missing endpoint tag, wrong query variation, or Netlify purge failure |
| JSON fresh, page stale | Missing page dependency tag or page ISR entry not purged |
| Reload fresh, navigation stale | Nuxt payload key/reactivity issue or stale JSON cache |
| Root edit purges, referenced edit does not | Page/JSON omitted the referenced document dependency tags |
| Webhook returns 202, new Netlify entry is still old | Fresh Netlify cache was repopulated from an upstream stale layer |

See `perf-cdn-caching.md` for header checks and the two Sanity API modes.

## Invalid requests or 404s become sticky

The route applied public cache headers before validation or before checking for null. Call
`setNoStore(event)` first and `setPublicCdnCache()` only after a successful document result. Page
errors must call `useNoStore()` before throwing.

## Webhook always returns 401

- Confirm `NUXT_SANITY_WEBHOOK_SECRET` is declared through `runtimeConfig.sanityWebhookSecret` and
  configured in the deployed environment.
- Confirm the Sanity webhook uses the same secret and sends `sanity-webhook-signature`.
- Verify the raw body; parsing and re-serializing it changes the HMAC input.
- Check clock skew against the explicit five-minute freshness window.
- Do not remove freshness validation to make an old captured request pass.

If the secret is missing, return 500 rather than misleadingly reporting an invalid signature.

## Webhook returns 202 but a delete remains visible

Ensure the document webhook triggers on delete/unpublish and projects `_id` and `_type`. Purging only
on update leaves the cached published page visible until TTL expiry.

## Broken `SanityImage` crop

Project `asset`, `hotspot`, and `crop` together:

```groq
mainImage { asset, hotspot, crop, alt }
```

## GROQ injection concern

Keep query text static and pass request data as `$parameters`:

```ts
const query = `*[_type == "post" && slug.current == $slug][0]`
await client.fetch(query, { slug: validatedSlug })
```

GROQ parameters contain JSON values rather than query expressions. Still validate lengths, allowed
locales, slug characters, and transport shape to control resource use and application behavior.

## Quick deployment checks

- Public page: browser revalidation header, targeted `Netlify-Vary`, finite ISR.
- Public JSON: browser revalidation header, durable Netlify header, cache tags, query variation.
- Preview: no-store for browser and Netlify, exact cookie validation.
- Invalid/missing/upstream error: no-store.
- Webhook: POST only, signed raw body, fresh timestamp, strict `_id`/`_type`, 202 after purge.
- No `defineCachedEventHandler` in `/api/sanity/*`.

## Docs

- Module issues: https://github.com/nuxt-modules/sanity/issues
- Sanity CORS: https://www.sanity.io/docs/cors
- Nuxt rendering: https://nuxt.com/docs/guide/concepts/rendering
