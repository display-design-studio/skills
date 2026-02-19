# core-custom-styles

Why it matters: Tailwind is designed to be extended rather than overridden — using `@layer`, `@utility`, and `@custom-variant` correctly integrates custom CSS into the Tailwind cascade instead of fighting it.

## Adding base styles

```css
@import "tailwindcss";

/* Global defaults for HTML elements */
@layer base {
  h1 { font-size: var(--text-3xl); font-weight: var(--font-weight-bold); }
  h2 { font-size: var(--text-2xl); font-weight: var(--font-weight-semibold); }
  a  { color: var(--color-blue-600); text-decoration: underline; }

  /* Body defaults */
  body {
    font-family: var(--font-sans);
    color: var(--color-gray-900);
    background-color: var(--color-white);
  }
}
```

## Adding component classes

```css
/* Use @layer components for reusable patterns overridable by utilities */
@layer components {
  .btn {
    display: inline-flex;
    align-items: center;
    padding: --spacing(2) --spacing(4);
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-medium);
    transition: background-color 150ms ease;
  }

  .btn-primary {
    background-color: var(--color-blue-600);
    color: var(--color-white);
  }

  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    box-shadow: var(--shadow-md);
  }
}
```

```html
<!-- Utility classes can still override component classes -->
<button class="btn btn-primary rounded-full">Rounded button</button>
<div class="card shadow-xl">Larger shadow</div>
```

## Adding custom utilities with `@utility`

```css
/* Simple custom utility */
@utility content-auto {
  content-visibility: auto;
}

/* Complex utility with nested selectors */
@utility scrollbar-hidden {
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
}
```

```html
<!-- Works with all modifiers like built-in utilities -->
<div class="content-auto lg:content-auto">
<div class="overflow-y-auto scrollbar-hidden">
```

## Using `@variant` in custom CSS

```css
.custom-element {
  background: var(--color-white);

  @variant dark {
    background: var(--color-gray-900);
  }

  @variant hover {
    background: var(--color-gray-50);
  }
}
```

## Custom variants with `@custom-variant`

```css
/* Shorthand (no nesting needed) */
@custom-variant hocus (&:hover, &:focus);

/* With nesting */
@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover { @slot; }
  }
}
```

```html
<button class="hocus:bg-blue-600">Hover or focus</button>
<a class="any-hover:underline">Only underlines on hover-capable devices</a>
```

## When NOT to use `@apply`

```css
/* Incorrect — using @apply for one-off element styles */
.hero { @apply text-4xl font-bold mb-8 text-gray-900; }

/* Correct — write utilities in HTML directly */
/* <h1 class="text-4xl font-bold mb-8 text-gray-900"> */

/* @apply is appropriate for genuinely reusable component abstractions */
@layer components {
  .form-input {
    @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm
           focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500;
  }
}
```

## Docs

- https://tailwindcss.com/docs/adding-custom-styles
- https://tailwindcss.com/docs/functions-and-directives
