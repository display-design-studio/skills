# Vendored Skills Sync Guide

This repo keeps upstream sources as git submodules in `vendor/` and copies selected skills into `skills/`.

## Current upstreams

- `vendor/antfu-skills` -> `https://github.com/antfu/skills`
- `vendor/sanity-agent-toolkit` -> `https://github.com/sanity-io/agent-toolkit`
- `vendor/gsap-skills` -> `https://github.com/greensock/gsap-skills`
- `vendor/vercel-agent-skills` -> `https://github.com/vercel-labs/agent-skills`
- `vendor/shopify-ai-toolkit` -> `https://github.com/Shopify/Shopify-AI-Toolkit`
- `vendor/julius-skills` -> `https://github.com/JuliusBrussee/skills`

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

rm -rf skills/web-design-guidelines
cp -R vendor/vercel-agent-skills/skills/web-design-guidelines skills/web-design-guidelines

rm -rf skills/gsap-core skills/gsap-timeline skills/gsap-scrolltrigger skills/gsap-plugins skills/gsap-react skills/gsap-utils skills/gsap-performance skills/gsap-frameworks

cp -R vendor/gsap-skills/skills/gsap-core skills/gsap-core
cp -R vendor/gsap-skills/skills/gsap-timeline skills/gsap-timeline
cp -R vendor/gsap-skills/skills/gsap-scrolltrigger skills/gsap-scrolltrigger
cp -R vendor/gsap-skills/skills/gsap-plugins skills/gsap-plugins
cp -R vendor/gsap-skills/skills/gsap-react skills/gsap-react
cp -R vendor/gsap-skills/skills/gsap-utils skills/gsap-utils
cp -R vendor/gsap-skills/skills/gsap-performance skills/gsap-performance
cp -R vendor/gsap-skills/skills/gsap-frameworks skills/gsap-frameworks

rm -rf skills/shopify-admin skills/shopify-app-store-review skills/shopify-custom-data skills/shopify-customer
rm -rf skills/shopify-dev skills/shopify-functions skills/shopify-hydrogen skills/shopify-liquid
rm -rf skills/shopify-onboarding-dev skills/shopify-onboarding-merchant skills/shopify-partner skills/shopify-payments-apps
rm -rf skills/shopify-polaris-admin-extensions skills/shopify-polaris-app-home skills/shopify-polaris-checkout-extensions
rm -rf skills/shopify-polaris-customer-account-extensions skills/shopify-pos-ui skills/shopify-shopifyql
rm -rf skills/shopify-storefront-graphql skills/shopify-use-shopify-cli skills/ucp

cp -R vendor/shopify-ai-toolkit/skills/shopify-admin skills/shopify-admin
cp -R vendor/shopify-ai-toolkit/skills/shopify-app-store-review skills/shopify-app-store-review
cp -R vendor/shopify-ai-toolkit/skills/shopify-custom-data skills/shopify-custom-data
cp -R vendor/shopify-ai-toolkit/skills/shopify-customer skills/shopify-customer
cp -R vendor/shopify-ai-toolkit/skills/shopify-dev skills/shopify-dev
cp -R vendor/shopify-ai-toolkit/skills/shopify-functions skills/shopify-functions
cp -R vendor/shopify-ai-toolkit/skills/shopify-hydrogen skills/shopify-hydrogen
cp -R vendor/shopify-ai-toolkit/skills/shopify-liquid skills/shopify-liquid
cp -R vendor/shopify-ai-toolkit/skills/shopify-onboarding-dev skills/shopify-onboarding-dev
cp -R vendor/shopify-ai-toolkit/skills/shopify-onboarding-merchant skills/shopify-onboarding-merchant
cp -R vendor/shopify-ai-toolkit/skills/shopify-partner skills/shopify-partner
cp -R vendor/shopify-ai-toolkit/skills/shopify-payments-apps skills/shopify-payments-apps
cp -R vendor/shopify-ai-toolkit/skills/shopify-polaris-admin-extensions skills/shopify-polaris-admin-extensions
cp -R vendor/shopify-ai-toolkit/skills/shopify-polaris-app-home skills/shopify-polaris-app-home
cp -R vendor/shopify-ai-toolkit/skills/shopify-polaris-checkout-extensions skills/shopify-polaris-checkout-extensions
cp -R vendor/shopify-ai-toolkit/skills/shopify-polaris-customer-account-extensions skills/shopify-polaris-customer-account-extensions
cp -R vendor/shopify-ai-toolkit/skills/shopify-pos-ui skills/shopify-pos-ui
cp -R vendor/shopify-ai-toolkit/skills/shopify-shopifyql skills/shopify-shopifyql
cp -R vendor/shopify-ai-toolkit/skills/shopify-storefront-graphql skills/shopify-storefront-graphql
cp -R vendor/shopify-ai-toolkit/skills/shopify-use-shopify-cli skills/shopify-use-shopify-cli
cp -R vendor/shopify-ai-toolkit/skills/ucp skills/ucp

rm -rf skills/caveman skills/fuck-slop skills/grill-me skills/junior-to-senior

cp -R vendor/julius-skills/skills/caveman skills/caveman
cp -R vendor/julius-skills/skills/fuck-slop skills/fuck-slop
cp -R vendor/julius-skills/skills/grill-me skills/grill-me
cp -R vendor/julius-skills/skills/junior-to-senior skills/junior-to-senior
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
- `skills/web-design-guidelines` is vendored from `vercel-labs/agent-skills`.
- `skills/shopify-*` (excluding `shopify-development`) and `skills/ucp` are vendored from `Shopify/Shopify-AI-Toolkit`.
- For first-party skills, use `metadata.author: display studio`.
- Keep upstream attribution unchanged for vendored skills.
- `skills/shopify-development` is a first-party skill maintained by display studio — it is not synced from any vendor.
- `skills/caveman`, `skills/fuck-slop`, `skills/grill-me`, and `skills/junior-to-senior` are vendored from `JuliusBrussee/skills`.
