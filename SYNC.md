# Vendored Skills Sync Guide

This repo keeps upstream sources as git submodules in `vendor/` and copies selected skills into `skills/`.

## Current upstreams

- `vendor/antfu-skills` -> `https://github.com/antfu/skills`
- `vendor/sanity-agent-toolkit` -> `https://github.com/sanity-io/agent-toolkit`
- `vendor/gsap-skills` -> `https://github.com/greensock/gsap-skills`

## Sync workflow

1) Update submodules to latest upstream commits:

```bash
git submodule update --remote --init --recursive
```

2) Re-copy selected skills into local `skills/`:

```bash
rm -rf skills/nuxt skills/vue skills/vite
rm -rf skills/sanity-best-practices
rm -rf skills/content-modeling-best-practices
rm -rf skills/seo-aeo-best-practices
rm -rf skills/content-experimentation-best-practices

cp -R vendor/antfu-skills/skills/nuxt skills/nuxt
cp -R vendor/antfu-skills/skills/vue skills/vue
cp -R vendor/antfu-skills/skills/vite skills/vite

cp -R vendor/sanity-agent-toolkit/skills/sanity-best-practices skills/sanity-best-practices
cp -R vendor/sanity-agent-toolkit/skills/content-modeling-best-practices skills/content-modeling-best-practices
cp -R vendor/sanity-agent-toolkit/skills/seo-aeo-best-practices skills/seo-aeo-best-practices
cp -R vendor/sanity-agent-toolkit/skills/content-experimentation-best-practices skills/content-experimentation-best-practices

rm -rf skills/gsap-core skills/gsap-timeline skills/gsap-scrolltrigger skills/gsap-plugins skills/gsap-react skills/gsap-utils skills/gsap-performance skills/gsap-frameworks

cp -R vendor/gsap-skills/skills/gsap-core skills/gsap-core
cp -R vendor/gsap-skills/skills/gsap-timeline skills/gsap-timeline
cp -R vendor/gsap-skills/skills/gsap-scrolltrigger skills/gsap-scrolltrigger
cp -R vendor/gsap-skills/skills/gsap-plugins skills/gsap-plugins
cp -R vendor/gsap-skills/skills/gsap-react skills/gsap-react
cp -R vendor/gsap-skills/skills/gsap-utils skills/gsap-utils
cp -R vendor/gsap-skills/skills/gsap-performance skills/gsap-performance
cp -R vendor/gsap-skills/skills/gsap-frameworks skills/gsap-frameworks
```

> **Note:** After syncing `gsap-*` skills, re-apply the display studio additions:
> - `## Debug` section in `skills/gsap-core/SKILL.md` (from `debug-iteration-workflow` custom rule)
> - `## Helper Functions` section in `skills/gsap-utils/SKILL.md` (from `tools-helper-functions-adoption` custom rule)

3) Validate discovery:

```bash
npx -y skills add . --list
```

4) Review changes:

```bash
git status --short
git diff
```

## Notes

- GSAP skills (`skills/gsap-*`) are vendored from `greensock/gsap-skills`; after syncing, re-apply the display studio additions noted above.
- For first-party skills, use `metadata.author: display studio`.
- Keep upstream attribution unchanged for vendored skills.
- `skills/shopify-development` is a first-party skill maintained by display studio — it is not synced from any vendor.
