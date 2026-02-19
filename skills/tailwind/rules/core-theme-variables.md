# core-theme-variables

Why it matters: in Tailwind v4, the `@theme` directive replaces `tailwind.config.js` entirely — all design tokens live in CSS. Misusing `@theme` vs `:root` or ignoring namespaces breaks utility class generation.

## `@theme` vs `:root`

```css
/* @theme — creates design tokens AND generates utility classes */
@theme {
  --color-brand: oklch(0.65 0.22 250);  /* generates bg-brand, text-brand, etc. */
  --spacing-18: 4.5rem;                  /* generates p-18, m-18, gap-18, etc. */
}

/* :root — defines CSS variables WITHOUT generating utilities */
:root {
  --header-height: 64px;  /* no utility class generated — use var() directly */
}
```

**Rule:** Use `@theme` for design tokens that should have corresponding utility classes. Use `:root` for layout constants and values that are only referenced via `var()`.

## Theme variable namespaces

Every namespace generates a specific set of utilities:

```css
@theme {
  /* Colors → bg-*, text-*, border-*, fill-*, stroke-*, ring-*, etc. */
  --color-brand-50:  oklch(0.97 0.02 250);
  --color-brand-500: oklch(0.60 0.22 250);
  --color-brand-900: oklch(0.25 0.08 250);

  /* Font families → font-* */
  --font-sans:    "Inter", ui-sans-serif, sans-serif;
  --font-heading: "Neue Haas Grotesk", sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  /* Font sizes → text-* (with optional line-height) */
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;

  /* Spacing → p-*, m-*, gap-*, w-*, h-*, inset-*, etc. */
  --spacing: 0.25rem;     /* base unit: 1 unit = 0.25rem */

  /* Breakpoints → sm:*, md:*, lg:*, xl:*, 2xl:* variants */
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;

  /* Border radius → rounded-* */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  /* Shadows → shadow-* */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

## Extending the default theme

```css
@import "tailwindcss";

@theme {
  /* Add to existing defaults */
  --color-accent: oklch(0.72 0.19 40);
  --breakpoint-3xl: 120rem;
  --font-display: "Satoshi", sans-serif;
}
```

Tailwind's default theme remains active; your additions extend it.

## Overriding defaults

```css
@import "tailwindcss";

@theme {
  /* Override a single value */
  --breakpoint-sm: 30rem;  /* sm: now triggers at 30rem instead of 40rem */

  /* Clear an entire namespace and replace */
  --color-*: initial;
  --color-white:   #fff;
  --color-black:   #000;
  --color-primary: oklch(0.60 0.22 250);
  --color-surface: oklch(0.97 0.01 250);
}
```

## Full custom theme (zero defaults)

```css
@import "tailwindcss";

@theme {
  --*: initial;  /* clears ALL default theme variables */

  --spacing: 4px;
  --font-body: "Inter", sans-serif;
  --color-bg:      oklch(0.98 0 0);
  --color-primary: oklch(0.60 0.22 250);
  --color-text:    oklch(0.15 0.02 250);
}
```

## `@theme inline` — for variables referencing other variables

```css
/* Without inline: utility class references the var, NOT the resolved value */
@theme {
  --font-sans: var(--font-inter);  /* can cause resolution issues */
}

/* With inline: utility class uses the resolved value at compile time */
@theme inline {
  --font-sans: var(--font-inter);  /* correct */
}
```

## Sharing theme across projects

```css
/* packages/brand/theme.css */
@theme {
  --color-brand-500: oklch(0.60 0.22 250);
  --font-heading: "Neue Haas Grotesk", sans-serif;
}

/* In each project */
@import "tailwindcss";
@import "../brand/theme.css";
```

## Using theme variables in CSS

All `@theme` variables compile to `:root` CSS custom properties:

```css
/* Available everywhere as var(--color-brand-500), etc. */
.custom-component {
  background: var(--color-brand-500);
  font-size: var(--text-lg);
  padding: --spacing(4);  /* shorthand: 4 × --spacing unit */
}
```

## Docs

- https://tailwindcss.com/docs/theme
- https://tailwindcss.com/docs/colors
