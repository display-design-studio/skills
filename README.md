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

### Vendored from `antfu/skills`

- `nuxt`
- `vue`
- `vite`

### Vendored from `sanity-io/agent-toolkit`

- `sanity-best-practices`
- `content-modeling-best-practices`
- `seo-aeo-best-practices`
- `content-experimentation-best-practices`

## Install (skills CLI)

Install one skill from this repository:

```bash
npx skills add <owner>/<repo> --skill gsap
```

Install a specific vendored skill:

```bash
npx skills add <owner>/<repo> --skill nuxt
npx skills add <owner>/<repo> --skill sanity-best-practices
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

- First-party skills maintained by this team should use `metadata.author: display studio`.
- Vendored skills keep their upstream metadata and attribution.
- Sources are preserved via `vendor/` submodules for update traceability.

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
7. Set frontmatter metadata:
   - `metadata.author: display studio`
   - `metadata.version`
   - `metadata.source`
8. Update this `README.md` with the new skill.

## Updating vendored skills

Update submodules to pull latest upstream content:

```bash
git submodule update --remote --init --recursive
```

Then re-copy needed skills from `vendor/*/skills/*` into `skills/*` and review diffs.

For a ready-to-run workflow, see `SYNC.md`.
