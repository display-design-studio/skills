# perf-purging-and-scanning

Why it matters: Tailwind v4's JIT engine only generates CSS for classes it detects in source files — misconfigured scanning leads to missing styles in production or bloated development CSS.

## How Tailwind v4 detects classes

Tailwind scans source files for class names at build time and generates only the CSS for classes it finds. It uses heuristic string matching — it does NOT parse HTML/JSX; it looks for anything that resembles a Tailwind utility.

**Default scanning:** Tailwind automatically scans all non-ignored files in your project. In v4, explicit `content` configuration is rarely needed.

## What Tailwind can and cannot detect

```html
<!-- Detectable: static strings -->
<div class="bg-blue-500 text-white p-4">

<!-- Detectable: template literals with full class names -->
<div class={`p-${size === 'lg' ? '8' : '4'}`}>   <!-- NOT detectable -->
<div class={size === 'lg' ? 'p-8' : 'p-4'}>      <!-- Detectable -->
```

```js
// Incorrect — dynamic construction breaks scanning
const color = 'blue'
const cls = `text-${color}-500`   // text-blue-500 won't be generated

// Correct — use full class names
const cls = color === 'blue' ? 'text-blue-500' : 'text-red-500'
```

**Rule:** Never construct class names by string interpolation. Always use complete utility class strings.

## Safelisting dynamically used classes

```css
/* app.css — safelist classes that can't be statically detected */
@source inline("text-red-500 text-green-500 text-blue-500 text-yellow-500");

/* Or a pattern */
@source inline("{text,bg}-{red,green,blue}-{500,600}");
```

## Ignoring files/directories

```css
/* Exclude directories from scanning (e.g. generated code, test fixtures) */
@source not("./src/generated/**");
@source not("./node_modules/**");  /* already excluded by default */
```

## Explicit source configuration

```css
/* Add sources not auto-detected (e.g. a component library) */
@source "../packages/ui/src/**/*.tsx";
```

## Build optimization

```bash
# Development — JIT, instant, no purging needed
npm run dev

# Production — minified, only used utilities
NODE_ENV=production npm run build

# Analyze output size
npx tailwindcss --output dist/styles.css --minify
```

## Common issues

**Styles missing in production but present in development:**
- Dynamic class construction — use full static strings
- Missing `@source` for files outside the auto-scan paths

**CSS file larger than expected:**
- Safelisted too many classes with broad patterns
- Not excluding generated/test files with `@source not()`

**Build times slow:**
- Narrow the scan scope with explicit `@source` declarations
- Avoid scanning `node_modules` (excluded by default in v4)

## Docs

- https://tailwindcss.com/docs/detecting-classes-in-source-files
