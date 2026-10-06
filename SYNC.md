# Vendored Skills Sync Guide

This repo keeps upstream sources as git submodules in `vendor/` and copies selected skills into `skills/`.

## Current upstreams

- `vendor/antfu-skills` -> `https://github.com/antfu/skills`
- `vendor/sanity-agent-toolkit` -> `https://github.com/sanity-io/agent-toolkit`
- `vendor/gsap-skills` -> `https://github.com/greensock/gsap-skills`
- `vendor/vercel-agent-skills` -> `https://github.com/vercel-labs/agent-skills`
- `vendor/shopify-ai-toolkit` -> `https://github.com/Shopify/Shopify-AI-Toolkit`
- `vendor/julius-skills` -> `https://github.com/JuliusBrussee/skills`
- `vendor/emil-skills` -> `https://github.com/emilkowalski/skills`
- `vendor/ponytail-skills` -> `https://github.com/dietrichgebert/ponytail`

## Sync workflow

1) Update submodules to latest upstream commits:

```bash
git submodule update --remote --init --recursive
```

2) Re-copy selected skills into local `skills/`:

```bash
rm -rf skills/nuxt skills/vue skills/vite

cp -R vendor/antfu-skills/skills/nuxt skills/nuxt
cp -R vendor/antfu-skills/skills/vue skills/vue
cp -R vendor/antfu-skills/skills/vite skills/vite


rm -rf skills/web-design-guidelines
cp -R vendor/vercel-agent-skills/skills/web-design-guidelines skills/web-design-guidelines

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

rm -rf skills/caveman skills/deslopify skills/grill-me skills/junior-to-senior

cp -R vendor/julius-skills/skills/caveman skills/caveman
cp -R vendor/julius-skills/skills/deslopify skills/deslopify
cp -R vendor/julius-skills/skills/grill-me skills/grill-me
cp -R vendor/julius-skills/skills/junior-to-senior skills/junior-to-senior

rm -rf skills/ponytail

cp -R vendor/ponytail-skills/skills/ponytail skills/ponytail

```

### Compacted skills (one skill per domain)

Domains listed in `scripts/vendor-map.json` are not copied with `cp -R`: `scripts/sync-vendored.mjs` turns each upstream skill into `skills/<group>/references/<topic>.md` (frontmatter stripped, skill names rewritten to links) and regenerates the topic table in the hand-written router `skills/<group>/SKILL.md` (between the `BEGIN/END TOPICS` markers).

```bash
node scripts/sync-vendored.mjs          # regenerate all groups
node scripts/sync-vendored.mjs --check  # fail if skills/<group> drifts from vendor + patches
```

Currently compacted: `gsap` (from `vendor/gsap-skills`), `sanity` (from `vendor/sanity-agent-toolkit`: sanity-best-practices, content-modeling, seo-aeo, content-experimentation) and `animation` (from `vendor/emil-skills`, next to our first-party `rules/`). Display studio additions live in `scripts/patches/` and are re-applied automatically (`## Debug` in `references/core.md`, `## Helper Functions` in `references/utils.md`). Never edit `references/` by hand. CI runs `--check`; a new upstream skill not listed in `vendor-map.json` only prints a warning, a removed or renamed one fails the sync.

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

- `skills/gsap` is a compacted skill generated from `greensock/gsap-skills` by `scripts/sync-vendored.mjs` (see "Compacted skills").
- `skills/web-design-guidelines` is vendored from `vercel-labs/agent-skills`.
- `skills/shopify-*` (excluding `shopify-development`) and `skills/ucp` are vendored from `Shopify/Shopify-AI-Toolkit`.
- For first-party skills, use `metadata.author: display studio`.
- Keep upstream attribution unchanged for vendored skills.
- `skills/shopify-development` is a first-party skill maintained by display studio — it is not synced from any vendor.
- `skills/caveman`, `skills/deslopify`, `skills/grill-me`, and `skills/junior-to-senior` are vendored from `JuliusBrussee/skills`.
- `skills/animation` mixes first-party `rules/` (our conventions, Nuxt and vanilla adapters) with `references/` generated from `emilkowalski/skills` (MIT). Not mapped: `animate-expo`, `mobile-native`, `break-ui`, `pick-ui-library`, `prototype`, `ask-sonner`, `write-swift`.
- `skills/sanity` is generated from `sanity-io/agent-toolkit` (MIT). Not mapped: `portable-text-conversion`, `portable-text-serialization`, `sanity-migration`. `nuxt-sanity` and `sanity-schema-accelerator` stay separate first-party skills.
