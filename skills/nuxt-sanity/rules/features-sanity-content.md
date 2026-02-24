# Portable Text with SanityContent

## Why it matters

`SanityContent` renders Portable Text (block arrays) from Sanity. Passing the wrong
prop structure, forgetting to register custom block types, or wrapping the component
incorrectly causes silent rendering failures or unstyled / missing content.

---

## Basic SanityContent usage

```vue
<script setup lang="ts">
const { data: post } = await useSanityQuery<Post>(
  `*[_type == "post" && slug.current == $slug][0]{ body }`,
  { slug: route.params.slug }
)
</script>

<template>
  <SanityContent :blocks="post?.body" />
</template>
```

The `:blocks` prop expects the raw Portable Text array from GROQ — pass it directly,
do not stringify or pre-process it.

---

## TypeScript typing for Portable Text arrays

```ts
import type { PortableTextBlock } from '@portabletext/types'

interface Post {
  body: PortableTextBlock[]
}
```

---

## Custom block components

Register custom renderers for non-standard block types, marks, and inline objects
via the `:serializers` (v1 API) or `:components` prop:

```vue
<template>
  <SanityContent
    :blocks="post.body"
    :serializers="serializers"
  />
</template>

<script setup lang="ts">
import CalloutBlock from '~/components/CalloutBlock.vue'
import InternalLink from '~/components/InternalLink.vue'

const serializers = {
  types: {
    callout: CalloutBlock,       // custom block type
  },
  marks: {
    internalLink: InternalLink,  // custom annotation/mark
  },
}
</script>
```

---

## Custom decorators (bold, italic, custom marks)

```ts
const serializers = {
  marks: {
    highlight: ({ children }: { children: string }) =>
      h('mark', { class: 'bg-yellow-200' }, children),
  },
}
```

---

## Incorrect

```vue
<!-- ❌ Wrapping SanityContent in a <div> when custom inline components emit block-level HTML -->
<div class="prose">
  <SanityContent :blocks="post.body" />
</div>

<!-- ❌ Passing serialized JSON string instead of array -->
<SanityContent :blocks="JSON.stringify(post.body)" />
```

## Correct

```vue
<!-- ✅ Pass block array directly, apply styles via serializers or parent wrapper -->
<SanityContent
  :blocks="post.body"
  :serializers="serializers"
  class="prose"
/>
```

---

## Notes

- `SanityContent` outputs semantic HTML — apply typography styles with a wrapper or via serializers
- For complex custom blocks (images, embeds), define them in `serializers.types`
- Images within Portable Text should use `SanityImage` inside the custom type component

---

## Docs

- SanityContent component: https://sanity.nuxtjs.org/components/sanity-content
- Portable Text spec: https://github.com/portabletext/portabletext
- Cross-reference: `sanity-best-practices/rules/pte-custom-components.md` for custom block design patterns
