# Principles

Non-negotiables for every animation we ship.

1. **Subtle.** Elegant and natural, never "template-like". Long durations (1.0–1.25s), soft easing, small
   offsets (40–60px), small staggers (0.06–0.1s).
2. **Transform and opacity only.** Never animate `width`, `height`, `top`, `left`, margins, or anything that
   triggers layout. Reveals must cause zero layout shift (offset with `transform`, not by changing flow).
3. **Content visible without JS.** SSR/static markup is fully visible. Hidden initial states are applied by JS
   (e.g. `gsap.fromTo`), never by CSS that depends on JS running to undo it. If JS or animations are off, the
   page still reads correctly.
4. **Start slightly before the element is fully in view** (`top 85–92%`), so motion feels anticipatory instead
   of late.
5. **Play once.** Scroll reveals use `once: true` and `toggleActions: 'play none none none'`. No replay on
   scroll-up.
6. **Respect `prefers-reduced-motion`.** Scroll reveals are skipped, Lenis is not created, fades in page
   transitions are skipped. See [reduced-motion-and-cleanup](reduced-motion-and-cleanup.md).
7. **One source of truth.** Presets live in one module (composable, or `PRESETS` object). Components reference a
   preset name; they never repeat raw GSAP config.
8. **Clean up.** Every tween/trigger is killed on unmount, route change and HMR.

## Performance quick table

Adapted from Emil Kowalski's `performance-cheatsheet.md` (MIT) and our own rules.

| Do | Don't |
| --- | --- |
| Animate `transform` / `opacity` | Animate `width`, `top`, etc. |
| Keep animated `blur()` under 20px | Large animated blurs |
| Virtualise long lists | Animate hundreds of DOM nodes |
| Specific properties in CSS transitions | `transition: all` |
| Write to `element.style` / CSS variables for per-frame values | Push per-frame values through framework state |
| Add `will-change: transform` only if you observe a 1px shift or flicker | Blanket `will-change` |
| Drive Lenis from the GSAP ticker (single RAF loop) | Two competing `requestAnimationFrame` loops |

For easing curves, duration budgets and spring guidance, use `emil-design-eng` instead of restating them here.
