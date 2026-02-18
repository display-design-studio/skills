# Vendored Skills Sync Guide

This repo keeps upstream sources as git submodules in `vendor/` and copies selected skills into `skills/`.

## Current upstreams

- `vendor/antfu-skills` -> `https://github.com/antfu/skills`
- `vendor/sanity-agent-toolkit` -> `https://github.com/sanity-io/agent-toolkit`

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
```

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

- Keep first-party skills (for example `skills/gsap`) independent from vendored updates.
- For first-party skills, use `metadata.author: display studio`.
- Keep upstream attribution unchanged for vendored skills.
