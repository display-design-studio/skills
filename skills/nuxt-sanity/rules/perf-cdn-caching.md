# CDN Caching, Preview Isolation, and Invalidation

This rule documents the Display Starter's Netlify deployment. Other providers need equivalent cache
headers, variation, tagging, and purge APIs.

## Governing rule

Every long-lived cache containing Sanity data must have a reliable invalidation path. A cache that is
both long-lived and unreachable by the webhook can silently repopulate a freshly purged downstream
cache with old data.

| Layer | Policy | Invalidation owner |
|---|---|---|
| Browser | `max-age=0, must-revalidate` | HTTP revalidation; not webhook-purgeable |
| Netlify page HTML | finite ISR, tagged | `purgeCache({ tags })` |
| Netlify `/api/sanity/*` JSON | durable 24h + 1h SWR, tagged | `purgeCache({ tags })` |
| Sanity API CDN | Sanity-managed published cache | Sanity invalidation, eventually consistent |
| Preview | `no-store` | No cache exists |

Do not add a default Nitro storage cache between Netlify and Sanity.

## Cache helpers

Keep browser and Netlify policy in separate headers. `Cache-Control` is visible to browsers and other
intermediaries; `Netlify-CDN-Cache-Control` applies only to Netlify.

```ts
// server/utils/cdnCache.ts
import type { H3Event } from 'h3'
import { setResponseHeader } from 'h3'

const netlifyMaxAge = 86400
const netlifyStaleWhileRevalidate = 3600

export function setPublicCdnCache(event: H3Event, tags: string[]) {
  const uniqueTags = [...new Set(tags.filter(Boolean))]

  setResponseHeader(event, 'Cache-Control', 'public, max-age=0, must-revalidate')
  setResponseHeader(
    event,
    'Netlify-CDN-Cache-Control',
    `public, durable, max-age=${netlifyMaxAge}, stale-while-revalidate=${netlifyStaleWhileRevalidate}`,
  )

  if (uniqueTags.length > 0)
    setResponseHeader(event, 'Netlify-Cache-Tag', uniqueTags.join(','))
}

export function setNoStore(event: H3Event) {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  setResponseHeader(event, 'Netlify-CDN-Cache-Control', 'no-store')
}
```

Set no-store at the start of a handler, then replace it with public headers only after a valid result.
This prevents validation errors, upstream failures, and missing documents from becoming negative
cache entries.

## Page route rules

```ts
routeRules: {
  '/**': {
    isr: 86400,
    headers: {
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  },
  '/api/**': { isr: false },
  '/api/cache/**': {
    isr: false,
    robots: false,
    headers: { 'cache-control': 'no-store' },
  },
  '/preview/**': {
    isr: false,
    robots: false,
    headers: { 'cache-control': 'no-store' },
  },
  '/_sanity/**': {
    isr: false,
    robots: false,
    headers: { 'cache-control': 'no-store' },
  },
},
```

Use a finite ISR duration as a recovery bound for missed webhooks. The published Sanity endpoints opt
out of ISR and set their own dedicated Netlify headers. Never cache the webhook or preview proxy.

## Cache variation

Pages must emit this on both public and preview responses:

```http
Netlify-Vary: cookie=sanity-preview-id
```

Validate the cookie against the private `previewModeId` before setting no-store. Do not use broad
`Vary: Cookie`, which creates high-cardinality cache objects. Do not vary `/api/sanity/*` by cookies.

Endpoint cache keys must distinguish all query parameters that affect the result. Verify the deployed
response uses `Netlify-Vary: query` or an explicit parameter list such as
`Netlify-Vary: query=lang|slug`. A cache-busting query parameter is meaningful only when the deployed
variation policy includes it.

## Tag every dependent cache object

The page HTML and its backing JSON are separate cache objects. Apply the same dependency tags to both
in one call because setting the header twice overwrites the earlier value.

```ts
const tags = [
  page._id,
  page._type,
  page.author?._id,
  page.author?._type,
].filter((tag): tag is string => Boolean(tag))

setPublicCdnCache(event, tags) // endpoint
useCacheTag(tags)              // page
```

Prefer precise IDs for rendered references. A type tag is useful for listings or when precise
dependencies cannot be projected, but it invalidates every cache object carrying that type.

Netlify accepts a comma-separated `Netlify-Cache-Tag` list. Deduplicate tags and stay within the
provider limits documented for tag count and length.

## Why the default Nitro cache is excluded

Without an explicitly shared `nitro.storage` driver, a cached handler can retain different entries in
different serverless instances. Netlify tag purge cannot clear those entries. A common failure is:

1. Webhook purges Netlify successfully.
2. The next request reaches another warm function instance.
3. Its Nitro cache returns old Sanity data.
4. Netlify stores that old response again with a fresh 24-hour TTL.

Use a plain `defineEventHandler` for `/api/sanity/*`. Add a Nitro layer only after providing a shared
driver, deterministic keys, coordinated Nitro-before-Netlify invalidation, and a short fallback TTL.
That is a separate architecture, not a local handler optimization.

## Sanity API-CDN consistency choice

Sanity recommends its API CDN for end-user reads, but recommends the live API when responding to
webhooks. The webhook can reach Netlify before Sanity API-CDN invalidation has propagated, so the
first Netlify regeneration can still read the previous result.

Choose per route:

### Scale-first default

- Keep the module client anonymous with `useCdn: true`.
- Let Netlify and the Sanity API CDN absorb heavy traffic.
- Accept a brief eventual-consistency window.
- Keep the finite Netlify TTL and an authenticated manual purge path as recovery controls.
- Monitor for a new durable entry created immediately after publish that still contains the old
  revision.

### Freshness-critical regeneration

- Fetch published data from a dedicated server client with `useCdn: false`.
- Keep the Netlify durable cache, so the live Sanity API is called only on Netlify misses, expiry, or
  purge rather than once per visitor.
- Use this for prices, availability, legal text, or any route where repopulating a 24-hour cache with
  stale data is unacceptable.

A fixed sleep in the webhook reduces the race but does not prove API-CDN propagation and must not be
documented as a freshness guarantee.

## Signed webhook

Use a POST-only route, verify the signature over the raw body, separately enforce a short signature
age, strictly parse `_id` and `_type`, and purge both tags. `@sanity/webhook` validates the HMAC but
does not reject an old correctly signed timestamp.

```ts
// server/utils/sanityWebhook.ts
import { decodeSignatureHeader } from '@sanity/webhook'

const maxSignatureAge = 5 * 60 * 1000
const sanityIdPattern = /^[\w.-]{1,256}$/
const sanityTypePattern = /^[\w-]{1,128}$/

export function hasFreshWebhookSignature(signature: string, now = Date.now()) {
  try {
    const { timestamp } = decodeSignatureHeader(signature)
    return Math.abs(now - timestamp) <= maxSignatureAge
  }
  catch {
    return false
  }
}

export function parseRevalidateBody(rawBody: string) {
  let value: unknown
  try {
    value = JSON.parse(rawBody)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON body' })
  }

  if (
    !value
    || typeof value !== 'object'
    || !('_id' in value)
    || !('_type' in value)
    || typeof value._id !== 'string'
    || typeof value._type !== 'string'
    || !sanityIdPattern.test(value._id)
    || !sanityTypePattern.test(value._type)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid webhook payload' })
  }

  return { _id: value._id, _type: value._type }
}
```

```ts
// server/api/cache/revalidate.post.ts
import { purgeCache } from '@netlify/functions'
import { isValidSignature } from '@sanity/webhook'

export default defineEventHandler(async (event) => {
  setNoStore(event)
  const rawBody = (await readRawBody(event)) ?? ''
  const signature = getHeader(event, 'sanity-webhook-signature') ?? ''
  const config = useRuntimeConfig(event)

  if (!config.sanityWebhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Sanity webhook secret is not configured',
    })
  }

  if (
    !hasFreshWebhookSignature(signature)
    || !(await isValidSignature(rawBody, signature, config.sanityWebhookSecret))
  ) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' })
  }

  const body = parseRevalidateBody(rawBody)
  await purgeCache({ tags: [body._id, body._type] })
  return new Response('Purged successfully!', { status: 202 })
})
```

Configure a Sanity document webhook with POST, the same secret, create/update/delete events, drafts
and versions disabled, and projection `{ _id, _type }`. Delete/unpublish events must be included so a
removed document cannot remain cached until TTL expiry.

Purge is idempotent, so duplicate delivery is safe. Sanity retries only a small number of retryable
failures and webhooks may be delayed or missed; retain finite TTLs and inspect the webhook attempts
log during incidents. For larger processing workflows, use `idempotency-key` and a queue, but a simple
tag purge does not need durable deduplication.

## Optional manual purge

A separately authenticated POST endpoint may call `purgeCache({ tags })` for incident recovery and
whole-site purge when no tags are provided. It is optional, must be no-store, must fail closed when
its secret is absent, and must never accept a secret in the URL. Whole-site purge causes a cold-cache
wave and should not be the normal webhook path.

## Diagnostics

Inspect deployed response headers rather than source assumptions:

```sh
curl -sS -D - -o /dev/null 'https://example.com/api/sanity/page?lang=en&slug=about'
curl -sS -D - -o /dev/null 'https://example.com/about'
```

Useful Netlify signals include `cache-status`, `age`, `netlify-vary`, and the dedicated CDN policy.
`Netlify-Cache-Tag` may be stripped from the client-facing response, so verify tagging behaviorally:
purge a tag and confirm the next matching response is regenerated.

When stale content appears:

1. Compare the cached page, the JSON endpoint, and a variation-forced request if query variation is
   enabled.
2. Query Sanity through both the API CDN and live API.
3. If the live API is correct but the API CDN is stale, the upstream propagation race is active.
4. If JSON is fresh but page HTML is stale, the page tag or page purge is missing.
5. If page reload is fresh but client navigation is stale, the JSON response tag or Nuxt payload key
   is wrong.
6. If both fresh and cached variants are stale, the comparison does not clear the HTML cache; inspect
   the upstream Sanity perspective, API choice, and publication state.

## Docs

- Netlify caching and variation: https://docs.netlify.com/build/caching/caching-overview/
- Netlify `purgeCache`: https://docs.netlify.com/build/functions/api/#purgecache
- Sanity API CDN: https://www.sanity.io/docs/content-lake/api-cdn
- Sanity webhook best practices: https://www.sanity.io/docs/content-lake/webhook-best-practices
- `@sanity/webhook`: https://github.com/sanity-io/webhook-toolkit
