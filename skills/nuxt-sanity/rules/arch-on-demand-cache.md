# Dependency-based on-demand cache

The Display Starter adopted this contract in [PR #37](https://github.com/display-design-studio/nuxt-starter/pull/37),
merged on 2026-10-30. Older derived projects may still use daily caching and raw ID/type tags.
Inspect the target checkout, specs and helpers before changing policies; the two tag contracts
cannot be mixed without migrating tagging and webhook invalidation together.

## Origin and retention

Derive a server-only client with
`useSanity(event).client.withConfig({ useCdn: false, perspective: 'published' })` and fetch with
`stega: false`. Do not mutate the base client or inherit preview credentials. For the sitemap
handler's incompatible event type, the installed module supports no-argument `useSanity()`;
verify with real Nuxt typecheck instead of casting the event.

Inspect the installed Netlify adapter and build output. Boolean ISR currently maps to a one-year
durable policy; numeric ISR can add a different stale window. Neither guarantees permanent storage.
Check asset retention warnings and retain normal deploy invalidation. Long TTLs need a documented
recovery decision: a finite fallback TTL or monitored delivery with reconciliation/recovery.
Keep sitemap module and XML route retention separate and verify every locale/index route.

Use one GROQ fetch per successful content origin execution, projecting rendered references and
listing items together. Nuxt payload hydration reuses the SSR result; CDN hits avoid origin reads.
Independent HTML/JSON misses, concurrent requests and SDK retries can still cause additional reads.
Do not add live-content tag queries to the published endpoint when preserving this query budget.

## Dependencies

- Share query-specific selectors between HTML and JSON.
- Use `doc:<id>` for rendered documents/references and `collection:<type>` for membership/order.
- Include collection dependencies for empty listings and types referenced by predicates/sorts.
- Accumulate registrations per request. Invalid/incomplete sets or exceeding Netlify's 500-tag
  limit must disable caching rather than truncate dependencies. Final no-store must remain sticky;
  use provisional no-store only when the installed helper explicitly supports it.
- A singleton selected with `[0]` or a slug lookup also depends on which document matches. Require
  enforced singleton/slug uniqueness or model that lookup dependency; selected IDs alone miss
  a new document that changes the result.
- Netlify tags are case insensitive. Do not promise isolation for IDs differing only in case.

If an anonymous fixture read unexpectedly returns null, compare it with an authenticated read and
check root/non-root document namespaces. Do not fix public access by attaching a preview token.

## Sanity webhook configuration

Use POST to `/api/cache/revalidate`, the deployment's `NUXT_SANITY_WEBHOOK_SECRET`, published
create/update/delete events, and disabled draft/version events. Include all dependent document
types in any filter and verify unpublish/delete behavior.

Minimal compatible projection:

```groq
{
  "_id": coalesce(after()._id, before()._id),
  "_type": coalesce(after()._type, before()._type)
}
```

For the namespaced implementation, optional signed fields `operation` (`create`, `update`,
`delete`) and boolean `collectionChanged` permit selective invalidation. Example for the current
page slug predicate only:

```groq
{
  "_id": coalesce(after()._id, before()._id),
  "_type": coalesce(after()._type, before()._type),
  "operation": delta::operation(),
  "collectionChanged": select(
    delta::operation() == "update" && coalesce(after()._type, before()._type) == "page"
      => delta::changedAny(slug),
    true
  )
}
```

Extend classification for every actual predicate/order field, including referenced types.
Authenticate the raw body and timestamp before trusting metadata. Content-only updates purge
`doc:<id>`; create/delete, true or missing classification also purge `collection:<type>`.
Legacy payloads remain conservative. Never accept arbitrary purge tags from the payload.
Authenticate draft/version deliveries before acknowledging them without a published purge.

Await purge completion, return retryable 503 on provider/network failures, and keep responses
no-store. Sanity retries retryable failures twice at 30-second intervals; document attempts logs
and authenticated scoped recovery. Netlify tag purges default to all site deploys: explicitly
scope synthetic integration tests so they cannot purge production entries.

## Evidence

Unit fixtures should cover paired HTML/JSON dependencies, unrelated detail retention, empty
listings, references, slug changes, deletes, invalid signatures, failed purges and sticky no-store.
Run lint/typecheck/build with the checkout's frozen dependencies; shared dependencies from another
branch establish compatibility evidence, not a reproducible verification of the branch lockfile.
Inspect Netlify build output and obtain authorized non-production CDN evidence before declaring
deployed invalidation correct. Preserve the target repository's current AGENTS/context policy
when reconciling an older branch.

Verify final 404 headers on HTML and JSON/crawler requests, including `Accept: application/json`,
`Sec-Fetch-Mode: cors` and curl user agents. Nitro's negotiated error renderer can overwrite an
earlier no-store directive. The current starter finalizes JSON errors in `server/error-handler.ts`
and calls `useNoStore()` in `app/error.vue`; helper-only tests do not cover those paths.

Build deployable artifacts on Linux or include native dependencies for the target runtime.
A macOS mdream binding can pass local tests but fail at Netlify function startup. Use actual
CDN/browser checks to distinguish adapter correctness from platform packaging errors.

Sources: [Netlify caching](https://docs.netlify.com/build/caching/caching-overview/),
[Sanity webhooks](https://www.sanity.io/docs/content-lake/webhooks).
