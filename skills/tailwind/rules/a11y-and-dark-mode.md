# a11y-and-dark-mode

Why it matters: accessibility and color scheme support are not afterthoughts — they affect usability for a large portion of users and are increasingly required by law (WCAG compliance).

## Screen Reader Utilities

```html
<!-- Visually hidden but accessible to screen readers -->
<button class="p-2">
  <svg aria-hidden="true">...</svg>
  <span class="sr-only">Close dialog</span>
</button>

<!-- Make focusable-only elements visible on focus (skip links) -->
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
  Skip to main content
</a>
```

## Focus Styles

Never remove focus rings without a proper replacement:

```html
<!-- Incorrect — removes focus indicator entirely -->
<button class="focus:outline-none">Submit</button>

<!-- Correct — replace with a visible custom ring -->
<button class="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
  Submit
</button>
```

`focus-visible:` only shows the ring for keyboard navigation, not mouse clicks.

## Color Contrast

Use Tailwind's palette with contrast in mind:

```html
<!-- Insufficient contrast: light text on light background -->
<p class="text-gray-300 bg-white">Hard to read</p>

<!-- Sufficient contrast (WCAG AA requires ≥ 4.5:1 for normal text) -->
<p class="text-gray-800 bg-white">Easy to read</p>
<p class="text-white bg-gray-800">Also fine</p>
```

Verify contrast ratios when defining custom `@theme` colors. Prefer OKLCH for predictable perceptual lightness.

## Reduced Motion

```html
<!-- Respect prefers-reduced-motion -->
<div class="
  transition-transform duration-300
  motion-reduce:transition-none
  motion-reduce:transform-none
  hover:-translate-y-1
">
```

```css
/* In custom CSS */
.animated-element {
  transition: transform 300ms ease;

  @variant motion-reduce {
    transition: none;
  }
}
```

## Forced Colors (High Contrast Mode)

```html
<!-- forced-color-adjust: none — preserve custom colors in Windows High Contrast -->
<div class="forced-color-adjust-none bg-brand-500 text-white">
  Important UI element
</div>

<!-- forced-color-adjust: auto (default) — allows OS to override colors -->
<div class="forced-color-adjust-auto">
  Regular content
</div>
```

## Dark Mode — Design Guidance

When implementing dark mode, ensure:

1. **All interactive states have dark variants:** `hover:`, `focus:`, `active:` need `dark:` counterparts.

```html
<button class="
  bg-blue-600 text-white
  hover:bg-blue-700
  dark:bg-blue-500
  dark:hover:bg-blue-400
">
```

2. **Shadows may need adjustment** — light shadows are invisible on dark backgrounds:

```html
<div class="shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10">
```

3. **Image contrast** — add a subtle overlay or adjust opacity in dark mode:

```html
<img class="opacity-100 dark:opacity-90" src="..." alt="...">
```

## ARIA attributes with Tailwind

Tailwind does not generate ARIA attributes — manage them in markup:

```html
<!-- Dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title" class="text-lg font-semibold">Confirm deletion</h2>
</div>

<!-- Navigation -->
<nav aria-label="Main navigation">
  <a href="/" aria-current="page" class="font-semibold">Home</a>
</nav>
```

## Docs

- https://tailwindcss.com/docs/dark-mode
- https://tailwindcss.com/docs/forced-color-adjust
- https://tailwindcss.com/docs/hover-focus-and-other-states
