# SanityImage Component and Image URL Building

## Why it matters

The `SanityImage` component auto-integrates with `@nuxt/image` when installed,
providing lazy loading, responsive sizing, LQIP, and format negotiation. Using
a raw `<img>` with a manually-constructed URL bypasses all of this and also
silently drops hotspot/crop data, causing subjects to be cropped out.

---

## Basic SanityImage usage

```vue
<template>
  <SanityImage
    :asset="image"
    :width="800"
    :height="600"
    auto="format"
  />
</template>
```

The `asset` prop accepts the full image object from GROQ (including `_ref`, `asset`, `hotspot`, `crop`).

---

## Hotspot and crop preservation

Always include `hotspot` and `crop` in your GROQ projection:

```groq
*[_type == "post"][0]{
  "image": mainImage{
    asset,
    hotspot,
    crop,
    alt
  }
}
```

Pass the full object to `SanityImage`:

```vue
<SanityImage
  :asset="post.image"
  :width="1200"
  :height="630"
  fit="crop"
/>
```

Without `hotspot`/`crop`, the image center is used — wrong for portrait subjects.

---

## @nuxt/image auto-integration

When `@nuxt/image` is installed, `SanityImage` automatically delegates to it,
enabling:
- `<NuxtImg>` attributes (`sizes`, `loading`, `format`, `quality`)
- Responsive `srcset` generation
- Image providers and caching

```vue
<SanityImage
  :asset="image"
  sizes="sm:100vw md:50vw lg:800px"
  loading="lazy"
  quality="80"
/>
```

Without `@nuxt/image`, `SanityImage` renders a plain `<img>` with Sanity image URL transforms.

---

## useSanityImage() — programmatic URL building

For cases where you need an image URL without a component (og:image meta tags, CSS backgrounds):

```vue
<script setup lang="ts">
const { urlFor } = useSanityImage()
const ogImageUrl = computed(() =>
  urlFor(post.value.image).width(1200).height(630).format('jpg').url()
)
</script>

<Head>
  <Meta property="og:image" :content="ogImageUrl" />
</Head>
```

---

## LQIP (Low-Quality Image Placeholder)

```vue
<script setup lang="ts">
const { urlFor } = useSanityImage()
const lqip = computed(() =>
  urlFor(post.value.image).width(20).blur(10).url()
)
</script>

<SanityImage
  :asset="post.image"
  :width="800"
  :height="600"
  :placeholder="lqip"
/>
```

---

## Incorrect

```vue
<!-- ❌ Raw <img> with manual URL — no responsive sizes, no hotspot, no lazy loading -->
<img :src="`https://cdn.sanity.io/images/${projectId}/${dataset}/${imageId}`" />
```

## Correct

```vue
<!-- ✅ SanityImage with full asset object including hotspot/crop -->
<SanityImage
  :asset="post.mainImage"
  :width="800"
  :height="600"
  fit="crop"
  auto="format"
/>
```

---

## Docs

- SanityImage component: https://sanity.nuxtjs.org/components/sanity-image
- useSanityImage: https://sanity.nuxtjs.org/composables/use-sanity-image
- Cross-reference: `sanity-best-practices/rules/image-hotspot.md` for GROQ projection patterns
