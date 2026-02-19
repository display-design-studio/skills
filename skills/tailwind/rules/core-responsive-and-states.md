# core-responsive-and-states

Why it matters: Tailwind's modifier system is the primary way to handle responsive design, interactive states, and dark mode — understanding how modifiers compose prevents redundant CSS and ensures consistent behavior.

## Responsive Design (mobile-first)

```html
<!-- Mobile first: base = mobile, then override at breakpoints -->
<div class="
  grid grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  xl:grid-cols-6
">
```

Default breakpoints (from `@theme`):

| Modifier | Min-width |
|----------|-----------|
| `sm:` | 40rem (640px) |
| `md:` | 48rem (768px) |
| `lg:` | 64rem (1024px) |
| `xl:` | 80rem (1280px) |
| `2xl:` | 96rem (1536px) |

Custom breakpoint:

```css
@theme {
  --breakpoint-3xl: 120rem;
}
```

```html
<div class="3xl:grid-cols-8">...</div>
```

## State Modifiers

### Hover, Focus, Active

```html
<button class="
  bg-blue-500
  hover:bg-blue-600
  active:bg-blue-700
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
  disabled:opacity-50
  disabled:cursor-not-allowed
">
  Click me
</button>
```

### Group and Peer

```html
<!-- group: apply styles to children when parent is hovered/focused -->
<div class="group">
  <h3 class="text-gray-700 group-hover:text-blue-600">Title</h3>
  <p class="text-gray-500 group-hover:text-gray-700">Description</p>
</div>

<!-- peer: apply styles to siblings based on sibling state -->
<input id="toggle" type="checkbox" class="peer sr-only">
<label for="toggle" class="cursor-pointer">Toggle</label>
<div class="hidden peer-checked:block">
  Visible when checkbox is checked
</div>
```

### First, Last, Odd, Even

```html
<ul>
  <li class="py-2 first:pt-0 last:pb-0 odd:bg-gray-50 even:bg-white">Item</li>
</ul>
```

## Dark Mode

### Strategy 1: media query (default)

```css
/* app.css */
@import "tailwindcss";
/* dark: variant uses prefers-color-scheme by default */
```

```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  Adapts to OS preference
</div>
```

### Strategy 2: class-based (manual toggle)

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));
```

```html
<!-- Toggle by adding/removing .dark on <html> -->
<html class="dark">
  <body class="bg-white dark:bg-gray-900">...</body>
</html>
```

```js
// Toggle dark mode
document.documentElement.classList.toggle('dark')
```

### Strategy 3: data attribute

```css
@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

```html
<html data-theme="dark">...</html>
```

## Custom Variants

```css
/* @custom-variant for data attributes */
@custom-variant theme-brand (&:where([data-theme="brand"] *));
```

```html
<html data-theme="brand">
  <div class="theme-brand:bg-brand-500">...</div>
</html>
```

## Stacking modifiers

```html
<!-- Responsive + state + dark -->
<button class="
  bg-blue-500
  hover:bg-blue-600
  dark:bg-blue-400
  dark:hover:bg-blue-500
  md:px-8
  md:hover:px-10
">
```

Order: responsive → dark → state (convention for readability; Tailwind handles any order).

## Docs

- https://tailwindcss.com/docs/responsive-design
- https://tailwindcss.com/docs/hover-focus-and-other-states
- https://tailwindcss.com/docs/dark-mode
