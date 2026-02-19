---
name: tailwind
description: Tailwind CSS v4 best-practices skill covering utility-first patterns, theme variables, responsive design, dark mode, custom styles, performance, accessibility, and a complete Figma-to-Tailwind theme generation workflow. Use when building, reviewing, or configuring Tailwind CSS projects.
license: MIT
metadata:
  author: display studio
  version: "1.0.0"
  source: https://tailwindcss.com/docs (v4.2)
---

# Tailwind CSS Best Practices

Tailwind CSS v4 guide organized as modular rules. Covers the utility-first model, `@theme` variables, responsive/state variants, custom styles, performance, accessibility, and the **Figma → Tailwind theme workflow** for generating design tokens directly from Figma variables.

## When to apply

- Setting up or configuring Tailwind CSS v4 in a project
- Building UI components with utility classes
- Customizing the design system (colors, fonts, spacing, breakpoints)
- Migrating from Tailwind v3 to v4
- Translating Figma design tokens into a Tailwind theme
- Reviewing code for utility-class correctness and theme consistency

## ROUTING: Which rule file to load

**IF setting up Tailwind or understanding how utility classes work:**
→ Read `rules/core-utility-model.md`

**IF working with theme variables (`@theme`), design tokens, colors, fonts, spacing:**
→ Read `rules/core-theme-variables.md`

**IF working with responsive design, hover/focus states, dark mode, or custom variants:**
→ Read `rules/core-responsive-and-states.md`

**IF adding custom CSS, component classes, base styles, or custom utilities:**
→ Read `rules/core-custom-styles.md`

**IF optimizing build size, purging unused classes, or configuring content detection:**
→ Read `rules/perf-purging-and-scanning.md`

**IF working on accessibility or dark mode strategies:**
→ Read `rules/a11y-and-dark-mode.md`

**IF translating Figma variables/design tokens into Tailwind v4 theme CSS:**
→ Read `rules/figma-to-theme-workflow.md` + see `figma-tokens/` templates

## Rule index

| Topic | Description | File |
|-------|-------------|------|
| Sections overview | Categories and reading order | [rules/_sections.md](rules/_sections.md) |
| Utility model | Utility-first principles, composing classes, arbitrary values | [rules/core-utility-model.md](rules/core-utility-model.md) |
| Theme variables | `@theme` directive, namespaces, extend/override, `inline`/`static` | [rules/core-theme-variables.md](rules/core-theme-variables.md) |
| Responsive & states | Breakpoints, hover/focus/dark variants, custom variants | [rules/core-responsive-and-states.md](rules/core-responsive-and-states.md) |
| Custom styles | `@layer`, `@utility`, `@variant`, component classes | [rules/core-custom-styles.md](rules/core-custom-styles.md) |
| Performance | Content detection, JIT, build optimization | [rules/perf-purging-and-scanning.md](rules/perf-purging-and-scanning.md) |
| A11y & dark mode | Accessibility utilities, dark mode patterns | [rules/a11y-and-dark-mode.md](rules/a11y-and-dark-mode.md) |
| **Figma workflow** | **Agent workflow: Figma variables → Tailwind `@theme` CSS** | [rules/figma-to-theme-workflow.md](rules/figma-to-theme-workflow.md) |

## Figma → Tailwind theme workflow

This skill includes a dedicated agent workflow to convert Figma design variables into Tailwind v4 `@theme` CSS files. The workflow is described in `rules/figma-to-theme-workflow.md` and uses the annotated templates in `figma-tokens/` as output targets.

**How to trigger it:** paste your Figma CSS variables into chat and ask the agent to generate the Tailwind theme files.

Template files in `figma-tokens/`:
- `colors.css` — `--color-*` namespace
- `typography.css` — `--font-*`, `--text-*`, `--font-weight-*`, `--tracking-*`, `--leading-*`
- `spacing.css` — `--spacing` and `--spacing-*`
- `radius-shadows.css` — `--radius-*`, `--shadow-*`
- `breakpoints.css` — `--breakpoint-*`

## Rule categories by priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Utility model & theme | CRITICAL | `core-` |
| 2 | Responsive & states | HIGH | `core-` |
| 3 | Custom styles | HIGH | `core-` |
| 4 | Figma workflow | HIGH | (standalone) |
| 5 | Performance | MEDIUM-HIGH | `perf-` |
| 6 | Accessibility | MEDIUM | `a11y-` |

## Coverage and maintenance

- Coverage map: `rules/_coverage-map.md`
- Source: https://tailwindcss.com/docs (v4.2)
- Update when Tailwind releases a new major/minor version with breaking `@theme` changes.
