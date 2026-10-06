---
name: motion-conventions
description: >-
  display studio conventions for performant, refined web animation: scroll-reveal presets (GSAP + ScrollTrigger),
  Lenis smooth scroll driven by the GSAP ticker, page transitions, reduced-motion handling and cleanup, with a
  Nuxt adapter (v-reveal directive + composable) and a vanilla JS adapter (data-reveal + initReveal). Defers taste,
  easing/duration budgets and review to the Emil Kowalski skills, and the GSAP API to the gsap skill.
  Use when the user asks to add or standardise scroll animations, reveal on scroll, smooth scrolling, page
  transitions, or to make animations subtle/performant/"premium" in a Nuxt or vanilla project.
  Keywords: scroll reveal, v-reveal, useScrollReveal, data-reveal, GSAP, ScrollTrigger, Lenis, smooth scroll,
  page transition, prefers-reduced-motion, animation performance, stagger, mask reveal, Nuxt, vanilla.
metadata:
  author: display studio
---

# Motion Conventions

One animation system for all display studio sites: subtle, long-and-soft, transform/opacity only, no layout shift.
The core is framework-agnostic; each project plugs it in through an adapter.

Distilled from the Ryoma frontend (`ryoma-frontend`, `docs/`), generalised so it also fits non-Nuxt projects.

## How to use this skill

1. Read [principles](rules/principles.md) — the non-negotiables.
2. Pick the building block you need:
   - Reveal on scroll → [reveal-presets](rules/reveal-presets.md)
   - Smooth scroll → [smooth-scroll](rules/smooth-scroll.md)
   - Route/page changes → [page-transitions](rules/page-transitions.md)
   - Accessibility, teardown, HMR → [reduced-motion-and-cleanup](rules/reduced-motion-and-cleanup.md)
3. Wire it into the project with one adapter:
   - Nuxt → [adapters/nuxt](rules/adapters/nuxt.md)
   - Vanilla / any other stack → [adapters/vanilla](rules/adapters/vanilla.md)
4. Skim [gotchas](rules/gotchas.md) before shipping.

## Related skills (do not duplicate them here)

| Need | Skill |
| --- | --- |
| Decide *whether* and *how* to animate (easing, durations, springs, taste) | `emil-design-eng`, `animate` |
| Review motion code against a craft bar | `review-animations` |
| Audit a codebase / find places worth animating | `improve-animations`, `find-animation-opportunities` |
| Name an effect precisely | `animation-vocabulary` |
| Gestures, velocity, momentum | `apple-design` |
| GSAP API, timelines, ScrollTrigger, React/frameworks, performance | `gsap` (see its `references/`) |

Rule of thumb: this skill answers "what are *our* defaults and how do we wire them"; the Emil skills answer
"does this feel right"; the `gsap` skill answers "how does the API work".

## Source attribution

The Ryoma values (presets, Lenis config, transition timings) are project-proven defaults, not laws: tune per
project, but change them deliberately and in one place. The vanilla adapter is new code written against the same
preset contract.
