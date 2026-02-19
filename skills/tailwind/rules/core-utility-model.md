# core-utility-model

Why it matters: Tailwind's utility-first model is fundamentally different from component CSS or BEM — misunderstanding it leads to fighting the framework, overusing arbitrary values, or recreating CSS abstraction layers Tailwind is designed to replace.

## Installation (v4)

```css
/* app.css */
@import "tailwindcss";
```

```bash
# With Vite
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

## Utility-first: compose, don't abstract prematurely

```html
<!-- Incorrect — extracting a component class before reuse is proven -->
<style>
  .card { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: ...; }
</style>
<div class="card">...</div>

<!-- Correct — compose utilities directly -->
<div class="bg-white p-6 rounded-lg shadow-md">...</div>
```

Extract component classes (`@layer components`) only when the pattern repeats across many files and the abstraction simplifies maintenance, not just to avoid writing utilities.

## Class ordering convention

Apply a consistent order to improve readability (enforceable with Prettier plugin):

```html
<!-- Layout → Flexbox/Grid → Spacing → Sizing → Typography → Colors → Effects → States -->
<div class="flex flex-col gap-4 p-6 w-full max-w-md text-sm text-gray-700 bg-white rounded-xl shadow hover:shadow-lg">
```

Use `prettier-plugin-tailwindcss` to auto-sort.

## Arbitrary values — use sparingly

```html
<!-- Use when a one-off value isn't in the theme -->
<div class="top-[117px] w-[calc(100%-2rem)] bg-[#FF5A00]">...</div>

<!-- Reference CSS variables -->
<div class="fill-(--brand-color) text-(color:--brand-text)">...</div>

<!-- Arbitrary properties (last resort) -->
<div class="[mask-type:luminance]">...</div>
```

**Rule:** If an arbitrary value appears more than twice in the codebase, it belongs in `@theme` as a named token.

## Responsive and state modifiers compose with any utility

```html
<div class="
  p-4
  md:p-8
  lg:p-12
  hover:bg-blue-50
  focus-within:ring-2
  dark:bg-gray-900
">
```

Every utility supports the full modifier system — no exceptions.

## Don't use `@apply` for one-off styles

```css
/* Incorrect — @apply is for component abstraction, not one-off elements */
.hero-title {
  @apply text-4xl font-bold text-gray-900 mb-4;
}

/* Use utilities directly in HTML, or — if truly reusable — use @layer components */
```

`@apply` is valid for shared component classes in CSS files, not as a replacement for writing utilities in HTML.

## Docs

- https://tailwindcss.com/docs/styling-with-utility-classes
- https://tailwindcss.com/docs/installation/using-vite
