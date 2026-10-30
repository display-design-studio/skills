# CDN Caching, Preview Isolation, and Invalidation

This rule covers the Display Starter on Netlify. For the current dependency contract and exact signed
webhook projections, also read `arch-on-demand-cache.md`. Inspect older derived checkouts before
using their cache helpers: raw ID/type tags and namespaced selectors require matching purge logic.

## Layers and origin

| Layer | Current starter policy | Invalidation |
|---|---|---|
| Browser | `max-age=0, must-revalidate` | HTTP revalidation |
| Netlify HTML | Boolean ISR; installed adapter maps it to one year | Document/collection tags, normal deploys |
| Netlify JSON | Durable one year, must-revalidate, no extra stale window | Same dependencies as HTML |
| Published Sanity reads | Anonymous live API, published perspective, stega disabled | Fresh origin execution after a miss |
| Preview | No-store, module-managed draft reads | No public cache |
| Sitemap | Separate 86400-second module/XML policy | Request-driven refresh, not document webhook |

Each successful content origin execution performs one GROQ fetch; include required references and
listing data in that query. Nuxt transfers SSR data in its payload for hydration. Independent JSON
misses, concurrent origin executions and SDK retries can still produce additional queries.

Derive a client without mutating module state:

```ts
const sanity = useSanity(event).client.withConfig({
  useCdn: false,
  perspective: 'published',
})
const result = await sanity.fetch(pageQuery, { lang, slug }, { stega: false })
```

Keep the module-wide `useCdn: true` default for module-managed reads. Other applications may choose
the API CDN for scale, but downstream refill can race API-CDN propagation after a webhook. A fixed
sleep does not prove freshness.

## Cache helpers and errors

Use the target repository's helpers instead of copying another version's implementation:

```ts
setNoStore(event, { provisional: true })
// validate parameters, perform one fetch, throw 400/404/502 as appropriate
setPublicCdnCache(event, getPageCacheTags(result))
```

The provisional flag is part of the current starter helper, not an H3/Nitro option. Only a successful
response may replace that initial state. Final preview/error/invalid-dependency no-store decisions
remain sticky and remove all cache tags. `useNoStore()` handles page errors; verify final rendered
headers too because Nitro's negotiated error handler can rewrite an earlier browser directive.

Successful responses separate browser and CDN headers:

```http
Cache-Control: public, max-age=0, must-revalidate
Netlify-CDN-Cache-Control: public, durable, max-age=31536000, must-revalidate
Netlify-Cache-Tag: doc:<id>
```

## Page rules and preview variation

Content uses `isr: true`; `/api/**` opts out of ISR and sets headers itself. Preview/cache-control
and Sanity proxy routes opt out and remain no-store. Resolve finite sitemap overrides for every
XML/index/locale route so catch-all page ISR cannot extend sitemap retention.

Pages emit on both public and preview responses:

```http
Netlify-Vary: cookie=sanity-preview-id
```

Validate that cookie against the private preview ID before bypassing caching. Do not vary public
JSON endpoints by cookies or use broad `Vary: Cookie`. Serverless query parameters normally
participate in Netlify cache keys; verify that variation includes all result-affecting parameters
such as `lang` and `slug`. An explicit `Netlify-Vary` policy must stay consistent for a URL.

## Shared dependency registration

Use one pure selector for HTML and JSON. Detail responses include rendered document/reference IDs;
listings additionally include collection types for membership/order, even when empty.

```ts
const tags = getDocumentCacheTags([hub, ...articles], ['article'])
setPublicCdnCache(event, tags) // JSON
useCacheTag(tags)              // HTML, evaluated from the same query data
```

The current helper accumulates and deduplicates tags per response. Legacy helpers may overwrite
headers; inspect the implementation before changing call patterns. Invalid/incomplete dependencies
or more than 500 tags must disable caching rather than silently truncate the set. Netlify tags are
case insensitive and limited to 1024 characters each.

## No uncoordinated Nitro cache

Without a shared storage driver, different warm serverless instances can retain different values.
Netlify tag purge cannot clear those entries: the next miss could refill a year-long CDN object from
stale Nitro data. Use plain handlers. Add a Nitro layer only with deterministic keys, shared storage,
coordinated invalidation and a bounded fallback lifetime.

## Signed webhook and recovery

Configure published create/update/delete events, exclude drafts/versions, and use the same private
secret as `NUXT_SANITY_WEBHOOK_SECRET`. Verify raw-body HMAC and signature freshness before using
the required `_id`/`_type` or optional `operation`/`collectionChanged`. See the projections and
classification rules in `arch-on-demand-cache.md`; never purge raw IDs against namespaced objects.

Await `purgeCache({ tags })`; provider/network errors must become retryable 503 responses.
Authenticated draft/version events are acknowledged without purging published content. Repeated
scoped purges are idempotent. Sanity retries retryable failures twice at 30-second intervals;
monitor delivery attempts and document authenticated tag-scoped recovery for longer outages.
Long-lived content has no daily self-healing guarantee.

Do not add an application manual-purge endpoint by default. Existing authenticated provider controls
can perform recovery. Explicitly choose site/deploy scope in tests: Netlify tag purges default to all
deploys of a site, and omitting tags can request a whole-site purge.

## Diagnostics

Inspect deployed HTML, JSON and Nuxt payload separately. `Cache-Status`, `Age`, origin markers
and response content establish cache reuse/regeneration; tags may be stripped from client headers.
Confirm new members, empty lists, references, slug changes and removal as well as content-only edits.

If live Sanity is current but the API CDN is stale, inspect upstream propagation. If JSON is fresh
but HTML is stale, inspect page dependency tagging. If a reload is fresh but navigation is stale,
inspect JSON caching and async-data keys. Clearing Nuxt data cannot purge a CDN.

## Sources

- [Netlify cache controls and invalidation](https://docs.netlify.com/build/caching/caching-overview/)
- [Netlify purgeCache](https://docs.netlify.com/build/functions/api/#purgecache)
- [Sanity API CDN](https://www.sanity.io/docs/content-lake/api-cdn)
- [Sanity webhooks](https://www.sanity.io/docs/content-lake/webhooks)
- [Sanity webhook toolkit](https://github.com/sanity-io/webhook-toolkit)
