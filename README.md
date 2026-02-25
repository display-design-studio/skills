<div align="center">
  <a href="https://github.com/display-design-studio/skills">
    <img src="https://avatars.githubusercontent.com/u/118281951?s=400&u=3ba5b42657ae2ac1a064b998b6110ea422317790&v=0" alt="Logo" width="80" height="80">
  </a>
  <h3 align="center">Display Studio Skills</h3>
  <p align="center">A curated skill collection for AI agents, including first-party skills and vendored framework/CMS best practices for use with the Agent Skills ecosystem and <code>skills.sh</code>.
</p>
</div>
<br>


## Repository pattern

- One directory per skill: `skills/<skill-name>/`
- Skill entrypoint: `skills/<skill-name>/SKILL.md`
- Modular rules: `skills/<skill-name>/rules/*.md`
- Upstream vendors tracked as submodules under `vendor/`

## Included skills

### First-party (Display Studio)

- `gsap`: comprehensive GSAP v3 best practices for fundamentals, plugins, tooling, performance, accessibility, and debug workflows.
- `nuxt-sanity`: `@nuxtjs/sanity` module integration best practices for Nuxt 3 + Sanity CMS. Covers `useSanityQuery`, `useLazySanityQuery`, `useSanity`, `SanityImage`, `SanityContent` (Portable Text), visual editing with stega, TypeScript typegen, named clients, Nitro server routes, CORS, and caching patterns.
- `ruby-on-rails`: full-stack Rails 8.1 best practices covering MVC lifecycle, Active Record, routing, views, forms, background jobs, mailer, WebSockets, Active Storage, security, testing, performance, and debugging.
- `tailwind`: Tailwind CSS v4 best practices covering utility-first patterns, `@theme` variables, responsive design, dark mode, custom styles, performance, accessibility, and a **Figma → Tailwind theme generation workflow** (paste Figma CSS variables, get `@theme` CSS files organized by category: colors, typography, spacing, radius/shadows, breakpoints).

### Vendored from `antfu/skills`

- `nuxt`
- `vue`
- `vite`

### Vendored from `sanity-io/agent-toolkit`

- `sanity-best-practices`
- `content-modeling-best-practices`
- `seo-aeo-best-practices`
- `content-experimentation-best-practices`

### Vendored from `sickn33/antigravity-awesome-skills`

- `shopify-development`: Shopify apps, extensions, themes, GraphQL API, webhooks, Liquid templating, billing, metafields (API v2026-01).

## Install (skills CLI)

Install one skill from this repository:

```bash
npx skills add <owner>/<repo> --skill gsap
```

Install a specific first-party or vendored skill:

```bash
npx skills add <owner>/<repo> --skill nuxt-sanity
npx skills add <owner>/<repo> --skill nuxt
npx skills add <owner>/<repo> --skill sanity-best-practices
```

Install a vendored shopify skill:

```bash
npx skills add <owner>/<repo> --skill shopify-development
```

Install all skills from this repository:

```bash
npx skills add <owner>/<repo> --skill '*'
```

List discoverable skills before install:

```bash
npx skills add <owner>/<repo> --list
```

## Attribution and authorship

- First-party skill frontmatter uses only `name` + `description` (Anthropic spec). Attribution is tracked in `rules/_coverage-map.md`.
- Vendored skills keep their upstream metadata and attribution.
- Sources are preserved via `vendor/` submodules for update traceability.

## Figma → Tailwind workflow

The `tailwind` skill includes a purpose-built agent workflow to translate Figma CSS variables into Tailwind v4 `@theme` files. See `skills/tailwind/rules/figma-to-theme-workflow.md` for the full instructions.

**How to use:**
1. Export CSS variables from Figma (via "Variables to CSS" plugin or Dev Mode copy)
2. Paste them in chat and ask the agent to generate the Tailwind theme files
3. The agent classifies variables (colors, typography, spacing, radius, shadows, breakpoints) and writes the corresponding `@theme` CSS files using the templates in `skills/tailwind/figma-tokens/`

## Authoring guidelines (first-party skills)

- Keep `SKILL.md` concise as the skill router and index.
- Put detailed implementation guidance in `rules/` with focused files.
- Prefer actionable rules with:
  - why it matters
  - incorrect pattern
  - correct pattern
  - links to official docs
- Keep a `_coverage-map.md` per skill to track source coverage.

### Checklist for new first-party skills

1. Create `skills/<skill-name>/SKILL.md`.
2. Create `skills/<skill-name>/rules/_sections.md`.
3. Create `skills/<skill-name>/rules/_coverage-map.md`.
4. Create modular rule files under `skills/<skill-name>/rules/`.
5. Use prefixed rule naming:
   - `core-*`, `plugin-*`, `tools-*`, `perf-*`, `a11y-*`, `debug-*`.
6. Ensure each rule file includes:
   - why it matters
   - incorrect pattern
   - correct pattern
   - official docs links
7. Update this `README.md` with the new skill.

## Updating vendored skills

Update submodules to pull latest upstream content:

```bash
git submodule update --remote --init --recursive
```

Then re-copy needed skills from `vendor/*/skills/*` into `skills/*` and review diffs.

For a ready-to-run workflow, see `SYNC.md`.
