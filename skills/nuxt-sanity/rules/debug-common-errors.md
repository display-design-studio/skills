# Common Errors and Debug Patterns

## Why it matters

Integration-layer bugs appear as cryptic CORS errors, undefined data on the server,
or hydration mismatches — each with a specific root cause and fix.
This file provides IF/THEN blocks for the most common failure modes.

---

## IF: CORS "Allow credentials" error

**Symptom:** Browser console shows `Access-Control-Allow-Origin` or
`credentialed requests` error when fetching from Sanity.

**Cause:** Sanity's CORS settings don't include your Nuxt origin with credentials allowed.

**Fix:**
1. Go to Sanity project settings → API → CORS origins
2. Add your Nuxt app origin (e.g., `http://localhost:3000`, `https://yoursite.com`)
3. Enable "Allow credentials" for that origin
4. If using a token, the origin must be in the allowlist with credentials enabled

---

## IF: `data` is `null` on first render (SSR)

**Symptom:** `post.value` is null on the server, content appears only after hydration.

**Causes and fixes:**

- Used `useLazySanityQuery` where `useSanityQuery` is needed:
  ```ts
  // ❌ useLazySanityQuery skips SSR — data is null on first render
  const { data } = useLazySanityQuery(query, params)
  // ✅ useSanityQuery fetches on server and includes data in SSR payload
  const { data } = await useSanityQuery(query, params)
  ```

- Missing `<Suspense>` boundary when using lazy queries in a nested component:
  ```vue
  <!-- In parent: -->
  <Suspense>
    <PostDetail :slug="slug" />
  </Suspense>
  ```

---

## IF: Hydration mismatch

**Symptom:** Vue hydration warning in the console; content flickers or resets on load.

**Cause:** Server and client fetch different data — typically because draft mode state
(cookie) is inconsistent between SSR and client.

**Fix:** Ensure the draft mode cookie is read consistently on both server and client:

```ts
// Use useCookie — works identically on server and client
const isDraft = useCookie('sanity-preview-id')
const perspective = computed(() => isDraft.value ? 'previewDrafts' : 'published')
```

---

## IF: `useSanity is not defined` in server route

**Symptom:** Runtime error in `server/api/*.ts` — `useSanity` is not a function.

**Cause:** Trying to import `useSanity` directly from the package instead of `#imports`.
Nuxt auto-imports only work in `pages/`, `components/`, `composables/`, and `app.vue`.

**Fix:**
```ts
// ❌
import { useSanity } from '@nuxtjs/sanity'

// ✅
import { useSanity } from '#imports'
```

---

## IF: Stale data after content update in Sanity Studio

**Symptom:** After saving a document in Studio, the Nuxt app still shows old content.

**Cause:** Sanity CDN caches responses for ~60 seconds; `useSanityQuery` cache may also hold stale data.

**Fix options:**
1. Call `refresh()` on the composable after a known update
2. Use `clearNuxtData(key)` to invalidate the cache
3. Set `useCdn: false` in your sanity config to bypass CDN (higher latency)
4. Set up a Sanity webhook → server route that calls `clearNuxtData`

---

## IF: Token appears in client-side network requests or bundle

**Symptom:** Browser DevTools shows `Authorization: Bearer sk...` in requests, or
token visible in `__nuxt_state` payload.

**Cause:** Token placed in `runtimeConfig.public` or logged in a `<script setup>` block.

**Fix:**
```ts
// nuxt.config.ts — token must be in private runtimeConfig
runtimeConfig: {
  sanity: {
    token: '', // ✅ private — set via NUXT_SANITY_TOKEN env var
  },
  // public: { sanityToken: '...' }  // ❌ exposed to browser
},
```

Never `console.log(useRuntimeConfig().sanity.token)` in components — it will appear in SSR output.

---

## IF: SanityImage renders broken URL or wrong crop

**Symptom:** Image URL is missing transform parameters or subject is incorrectly cropped.

**Cause:** GROQ projection missing `hotspot` and `crop` fields.

**Fix:** Include hotspot/crop in every image projection:
```groq
mainImage{ asset, hotspot, crop, alt }
```

---

## IF: Webhook always returns 401

**Symptom:** `POST /api/cache/revalidate` returns 401 on every Sanity document publish; cache
is never purged.

**Cause:** `NUXT_SANITY_WEBHOOK_SECRET` is not set in the runtime environment. When the env var
is absent, `useRuntimeConfig().sanityWebhookSecret` resolves to `''` and never matches the
incoming `x-sanity-webhook-secret` header — so every request is rejected.

**Fix:**
1. Declare the key in `nuxt.config.ts` runtimeConfig (empty string placeholder):
   ```ts
   runtimeConfig: {
     sanityWebhookSecret: '', // set via NUXT_SANITY_WEBHOOK_SECRET
   }
   ```
2. Add the secret to `.env` (local):
   ```
   NUXT_SANITY_WEBHOOK_SECRET=your-secret-here
   ```
3. Add a placeholder to `.env.example` so other developers know it is required:
   ```
   NUXT_SANITY_WEBHOOK_SECRET=
   ```
4. Set the same value in Netlify environment variables (production)

---

## Quick troubleshooting checklist

| Symptom | First check |
|---------|-------------|
| Preview not entering | Verify `sanity-preview-id` cookie is set; check `NUXT_SANITY_VISUAL_EDITING_STUDIO_URL` |
| Stale content outside preview | Check `getKey` format, `maxAge`, and that webhook `/api/cache/revalidate` is firing |
| Search showing no drafts | Expected — search always uses the cached server route, never the preview path |
| CDN cache fragmentation | Confirm `Vary: Cookie` is absent on `/api/**` responses (check response headers in Netlify logs) |
| All pages cold after a publish | Verify `useStorage('cache').clear()` is NOT called in `revalidate.ts` — only `purgeCache({ tags })` should run |

---

## Docs

- Module issues: https://github.com/nuxt-modules/sanity/issues
- Sanity CORS settings: https://www.sanity.io/docs/cors
- Nuxt hydration: https://nuxt.com/docs/guide/concepts/rendering#universal-rendering
