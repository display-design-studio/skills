# Adding a Sanity Document Type to the Display Starter

Add a routed document type as one connected change: query, published endpoint, preview-switch
composable, page, dependency tags, and webhook coverage.

## 1. Define the query

Use parameters, project `_id` and `_type`, and include identity fields for every referenced document
whose content is rendered.

```ts
// shared/utils/articleQuery.ts
import { defineQuery } from 'groq'

export const articleQuery = defineQuery(`
  *[_type == "article" && language == $lang && slug[$lang].current == $slug][0] {
    ...,
    _id,
    _type,
    author->{ _id, _type, name }
  }
`)
```

## 2. Add the published endpoint

Use the shared validators and cache helpers. Keep all failure responses no-store and cache only a
successful published result.

```ts
// server/api/sanity/article.get.ts
import type { ArticleQueryResult } from '#sanity-types'

export default defineEventHandler(async (event) => {
  setNoStore(event)
  const lang = getSanityLocale(event)
  const slug = getSanitySlug(event)
  const sanity = useSanity()
  let article: ArticleQueryResult

  try {
    article = await sanity.fetch<ArticleQueryResult>(
      articleQuery,
      { lang, slug },
      { stega: false },
    )
  }
  catch (error) {
    console.error('Failed to fetch the Sanity article document', error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch from Sanity' })
  }

  if (!article)
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  setPublicCdnCache(event, [
    article._id,
    article._type,
    article.author?._id,
    article.author?._type,
  ].filter((tag): tag is string => Boolean(tag)))

  return article
})
```

Do not wrap the endpoint in `defineCachedEventHandler`. If a listing result has no single root
document, tag it with the listed document IDs and the relevant listing type.

## 3. Add the preview-switch composable

Accept a reactive page parameter object, expose it to `useSanityQuery` through reactive getters, and
return the full async-data result from both branches.

```ts
// app/composables/useSanityArticle.ts
import type { MaybeRef } from 'vue'
import type { ArticleQueryResult } from '#sanity-types'
import { reactive, toValue } from 'vue'

export function useSanityArticle(params: MaybeRef<Required<SanityQueryParams>>) {
  const visualEditingState = useSanityVisualEditingState()
  const previewParams = reactive({
    get lang() {
      return toValue(params).lang
    },
    get slug() {
      return toValue(params).slug
    },
  })

  if (Boolean(visualEditingState?.enabled))
    return useSanityQuery<ArticleQueryResult>(articleQuery, previewParams)

  return useFetch<ArticleQueryResult>('/api/sanity/article', {
    query: () => toValue(params),
  })
}
```

## 4. Add the page

Use computed route/locale parameters. Convert missing content and fetch failures into no-store page
errors before assigning cache tags.

```vue
<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const params = computed(() => ({
  lang: locale.value,
  slug: route.params.slug as string,
}))

const { data: article, error } = await useSanityArticle(params)

if (error.value || !article.value) {
  useNoStore()
  const statusCode = error.value && typeof error.value === 'object'
    && 'statusCode' in error.value
    ? Number(error.value.statusCode)
    : 404

  throw createError({
    statusCode,
    statusMessage: statusCode === 404 ? 'Article not found' : 'Failed to load article',
  })
}

useCacheTag([
  article.value._id,
  article.value._type,
  article.value.author?._id,
  article.value.author?._type,
].filter((tag): tag is string => Boolean(tag)))
</script>
```

The page and endpoint must calculate the same dependency tags. Extract a shared pure tag builder
when the list is non-trivial so the two call sites cannot drift.

## 5. Verify webhook coverage

The base webhook purges the changed `_id` and `_type`; no per-document-type switch is needed. Ensure
the Sanity webhook:

- uses POST and the signed secret configured by `NUXT_SANITY_WEBHOOK_SECRET`;
- triggers on create, update, and delete/unpublish for published documents;
- does not trigger for drafts or release versions unless intentionally required;
- projects `{ _id, _type }`;
- targets `/api/cache/revalidate`.

Reference changes work because responses that render the reference carry its ID/type tags. If the
query cannot expose precise dependency IDs, a broader type tag is an acceptable fallback, but it
purges more pages and should be documented as such.

## 6. Verify behavior

1. Request the endpoint twice and confirm the second production response is a Netlify cache hit.
2. Confirm invalid locale/slug, missing content, and upstream failures return no-store.
3. Enter Presentation and confirm draft changes update without caching preview HTML or JSON.
4. Publish the root document and confirm both page HTML and JSON are purged.
5. Publish a rendered reference and confirm the dependent page is also purged.
6. Delete/unpublish the root document and confirm the next request returns an uncached 404.

Update the project architecture documentation with the endpoint, parameters, tags, and any choice to
use the live Sanity API instead of the API CDN.
