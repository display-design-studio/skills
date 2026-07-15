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

## Programmatic URL building (no `useSanityImage` composable)

There is no `useSanityImage()` composable in `@nuxtjs/sanity` — for cases where you need an
image URL without rendering `SanityImage` (og:image meta tags, CSS backgrounds), build the URL
with the official `@sanity/image-url` builder against your Sanity client config:

```vue
<script setup lang="ts">
import imageUrlBuilder from '@sanity/image-url'

const { config } = useSanity()
const builder = imageUrlBuilder(config)
const urlFor = (source: unknown) => builder.image(source)

const ogImageUrl = computed(() =>
  urlFor(post.value.image).width(1200).height(630).format('jpg').url()
)
</script>

<Head>
  <Meta property="og:image" :content="ogImageUrl" />
</Head>
```

---

## Width and quality conventions

All image URL calls use `auto('format')` (served as WebP/AVIF automatically) and these caps:

| Usage | Width | Quality |
|-------|-------|---------|
| Mobile hero images | `800` | `80` |
| Section / article images | `1500` | `80` |
| Full-bleed images | `1920` | `80` |
| Desktop hero images | `1500` | `80` |

Always pass the full image object (e.g. `urlFor(image)`) — not `image.asset` — so hotspot/crop
metadata is preserved for smart cropping.

---

## LQIP (Low-Quality Image Placeholder)

```vue
<script setup lang="ts">
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
- Image URL builder (`@sanity/image-url`): https://www.sanity.io/docs/image-url
- Cross-reference: `sanity-best-practices/rules/image-hotspot.md` for GROQ projection patterns
