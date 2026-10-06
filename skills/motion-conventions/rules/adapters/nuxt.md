# Nuxt adapter

Reference layout (Nuxt 3/4, `app/` directory):

| File | Role |
| --- | --- |
| `app/composables/useScrollReveal.ts` | Centralised presets + GSAP logic (the `PRESETS` from [reveal-presets](../reveal-presets.md)); accepts `duration`, `delay`, `start`, `stagger` overrides; returns a cleanup |
| `app/directives/reveal.ts` | `v-reveal` directive: calls the composable on mount, cleans up on unmount |
| `app/plugins/reveal.client.ts` | Registers the directive in the browser |
| `app/plugins/reveal.server.ts` | Registers an SSR **stub** only (content stays visible in SSR markup) |
| `app/plugins/lenis.client.ts` | Lenis + GSAP ticker ([smooth-scroll](../smooth-scroll.md)); provides `$lenis` (`null` with reduced motion) |
| `app/plugins/page-transition.client.ts` | Overlay sequence ([page-transitions](../page-transitions.md)) |
| `app/router.options.ts` | `scrollBehavior` returns `{ top: 0 }` always, including back/forward |
| `app/app.vue` | Hosts the transition overlay |

## Usage

```vue
<div class="overflow-hidden"><h2 v-reveal="'title'">Title</h2></div>
<p v-reveal="'text'">Text</p>
<article v-reveal="'card'">…</article>
<div v-reveal="{ preset: 'text', delay: 0.08 }">…</div>
<ul v-reveal="{ preset: 'stagger', start: 'top 98%' }">…</ul>
```

## Notes
- `v-reveal` takes a preset name or `{ preset, ...overrides }`.
- The directive owns only the tweens it created; `unmounted` kills them. `gsap.matchMedia` handles reduced
  motion and its toggling.
- Register `ScrollTrigger` once in a client plugin, not per component.
- Lenis access: `useNuxtApp().$lenis` — always null-check.
- Page transition hooks: router `beforeEach` / `afterEach` (or `page:start`) for the cover, `page:loading:end`
  for step 4. Hash-only changes skip the overlay.
- Never use `v-reveal` on elements that must be visible on first paint above the fold for LCP without checking
  the preset: opacity-0 initial states delay LCP. Prefer `fade`/`text` with a short delay, or exclude the hero
  image.
