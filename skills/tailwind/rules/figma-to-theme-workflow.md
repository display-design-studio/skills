# figma-to-theme-workflow

**Display Studio — Agent Workflow**

Why it matters: Figma variables are the single source of truth for a design system. This workflow lets the agent translate them directly into Tailwind v4 `@theme` CSS files, eliminating manual translation errors and keeping the design system in sync with the codebase.

---

## Overview

When a user provides Figma CSS variables (exported via a plugin like "Variables to CSS", "Token Studio", or copy-paste from Figma Dev Mode), the agent:

1. **Parses** the input CSS custom properties
2. **Classifies** each variable into a category
3. **Maps** Figma naming to Tailwind v4 `@theme` namespace conventions
4. **Generates** the `@theme` CSS blocks, one file per category
5. **Outputs** the files ready to be placed in the project (see Output paths below)

---

## Input format expected

The user provides CSS custom properties in one of these forms:

### Form A — Figma Dev Mode / Variables to CSS plugin output

```css
--color-brand-primary: #FF5A00;
--color-brand-secondary: #1A1A2E;
--color-neutral-100: #F5F5F5;
--color-neutral-900: #1A1A1A;
--spacing-base: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 40px;
--font-heading: "Neue Haas Grotesk Display", sans-serif;
--font-body: "Inter", sans-serif;
--font-mono: "JetBrains Mono", monospace;
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;
--text-4xl: 48px;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-full: 9999px;
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

### Form B — Scoped Figma CSS (with `:root` wrapper — strip the selector)

```css
:root {
  --color-primary: #FF5A00;
  /* ... */
}
```

Strip `:root {}` and process the inner declarations.

---

## Step 1 — Classify variables by category

Map each variable name to its category using these rules:

| Pattern in name | Category | Target file |
|----------------|----------|-------------|
| `--color-*` | Colors | `colors.css` |
| `--font-*` (font-family) | Typography | `typography.css` |
| `--text-*` (font-size) | Typography | `typography.css` |
| `--font-weight-*` | Typography | `typography.css` |
| `--tracking-*`, `--leading-*` | Typography | `typography.css` |
| `--spacing-*` or `--spacing` | Spacing | `spacing.css` |
| `--radius-*` | Radius | `radius-shadows.css` |
| `--shadow-*`, `--drop-shadow-*`, `--inset-shadow-*` | Shadows | `radius-shadows.css` |
| `--breakpoint-*` | Breakpoints | `breakpoints.css` |
| anything else | Custom | `colors.css` (append as comment) |

---

## Step 2 — Map names to Tailwind v4 namespaces

Tailwind v4 has strict namespace conventions. Remap Figma names to match:

### Colors

Figma names like `--color-brand-primary` → keep as-is (`--color-brand-primary` is valid).

```
--color-brand-primary  → --color-brand-primary   (✓ already correct)
--primary              → --color-primary           (add --color- prefix)
--brand                → --color-brand
--neutral-100          → --color-neutral-100       (add --color- prefix)
```

Convert HEX/RGB values to OKLCH when possible for perceptual consistency:

```
#FF5A00  → oklch(0.66 0.20 40)     (approximate — use online converter or keep HEX if unsure)
#1A1A2E  → oklch(0.18 0.05 270)
rgba(0, 0, 0, 0.1) → rgb(0 0 0 / 0.1)  (modern syntax)
```

**Note:** OKLCH conversion is preferred but not required. If unsure, keep the original HEX/RGB value — it is valid in `@theme`.

### Typography

```
--font-heading  → --font-heading    (✓ font-* namespace for font-family)
--font-body     → --font-body
--text-xs       → --text-xs         (✓ text-* namespace for font-size)
--text-sm       → --text-sm
```

Include line-height companion variables when provided or use `calc()`:

```css
--text-base:               1rem;
--text-base--line-height:  1.5;    /* generates leading companion */
```

Font weight names:

```
100 → --font-weight-thin
200 → --font-weight-extralight
300 → --font-weight-light
400 → --font-weight-normal
500 → --font-weight-medium
600 → --font-weight-semibold
700 → --font-weight-bold
800 → --font-weight-extrabold
900 → --font-weight-black
```

### Spacing

If Figma exports a single base unit:

```css
/* Single base unit (Tailwind multiplier: 1 unit = --spacing value) */
--spacing: 4px;    /* all spacing utilities use multiples: p-4 = 4 × 4px = 16px */
```

If Figma exports named spacing steps, keep them as named tokens:

```css
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
```

Convert px to rem where appropriate (1rem = 16px base):

```
4px  → 0.25rem
8px  → 0.5rem
16px → 1rem
24px → 1.5rem
32px → 2rem
40px → 2.5rem
```

### Breakpoints

Convert px to rem:

```
640px  → 40rem
768px  → 48rem
1024px → 64rem
1280px → 80rem
1536px → 96rem
```

---

## Step 3 — Generate `@theme` CSS blocks

For each category, generate a CSS file with:
1. A comment header identifying the source
2. The `@theme` block with all variables for that category
3. Inline comments for any non-obvious conversions

---

## Step 4 — Output

Write each file to the project's `src/styles/figma-tokens/` directory (or wherever the user specifies). Each file can be imported individually or together:

```css
/* app.css */
@import "tailwindcss";

@import "./styles/figma-tokens/colors.css";
@import "./styles/figma-tokens/typography.css";
@import "./styles/figma-tokens/spacing.css";
@import "./styles/figma-tokens/radius-shadows.css";
@import "./styles/figma-tokens/breakpoints.css";
```

---

## Example: full conversion

**Input (from Figma):**

```css
--color-brand-primary: #FF5A00;
--color-brand-secondary: #1A1A2E;
--color-neutral-100: #F5F5F5;
--font-heading: "Neue Haas Grotesk Display", sans-serif;
--font-body: "Inter", sans-serif;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--spacing-base: 4px;
--radius-md: 8px;
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--breakpoint-md: 768px;
```

**Output — `colors.css`:**

```css
/* Figma Design Tokens — Colors */
/* Source: Figma Variables export */

@theme {
  --color-brand-primary:   oklch(0.66 0.20 40);   /* #FF5A00 */
  --color-brand-secondary: oklch(0.18 0.05 270);  /* #1A1A2E */
  --color-neutral-100:     oklch(0.97 0 0);        /* #F5F5F5 */
}
```

**Output — `typography.css`:**

```css
/* Figma Design Tokens — Typography */

@theme {
  --font-heading: "Neue Haas Grotesk Display", sans-serif;
  --font-body:    "Inter", sans-serif;

  --text-base: 1rem;     /* 16px */
  --text-lg:   1.125rem; /* 18px */
  --text-xl:   1.25rem;  /* 20px */
}
```

**Output — `spacing.css`:**

```css
/* Figma Design Tokens — Spacing */

@theme {
  --spacing: 0.25rem; /* base unit: 4px — all spacing utilities use multiples */
}
```

**Output — `radius-shadows.css`:**

```css
/* Figma Design Tokens — Radius & Shadows */

@theme {
  --radius-md: 0.5rem; /* 8px */

  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

**Output — `breakpoints.css`:**

```css
/* Figma Design Tokens — Breakpoints */

@theme {
  --breakpoint-md: 48rem; /* 768px */
}
```

---

## Notes for the agent

- **Ask for clarification** if variable names are ambiguous (e.g. `--primary` with no namespace prefix).
- **Do not override** default Tailwind values not present in the Figma export (e.g. don't add `--color-*: initial` unless the user explicitly wants a full custom theme with no defaults).
- **Preserve comments** from the Figma export if they provide context.
- **Flag** variables that cannot be classified (output them as a comment block at the end of `colors.css`).
- If the user asks for a **full custom theme** (no Tailwind defaults), add `--*: initial;` as the first line inside `@theme` in `colors.css` and note this in the output.
