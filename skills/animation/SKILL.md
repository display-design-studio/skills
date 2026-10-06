---
name: animation
description: >-
  display studio web animation in one skill: our conventions (scroll-reveal presets, Lenis smooth scroll on the GSAP
  ticker, page transitions, reduced motion, cleanup, Nuxt and vanilla adapters) plus Emil Kowalski's craft guidance
  (when and how to animate, easing, durations, springs, gestures, review and audit of motion code).
  Use when the user asks to add, standardise, review or improve animation: scroll reveals, smooth scrolling, page
  transitions, hover/press feedback, drawers and popovers, "make it feel premium", performance or reduced-motion
  problems. For the GSAP API itself use the gsap skill.
  Keywords: scroll reveal, v-reveal, data-reveal, Lenis, page transition, easing, spring, prefers-reduced-motion,
  animation performance, review animations, animation audit, Nuxt, vanilla.
license: MIT
metadata:
  author: display studio
---

# Animation

One animation system for all display studio sites: subtle, long-and-soft, transform/opacity only, no layout shift.
Two layers: **our conventions** (`rules/`, first-party) say what the defaults are and how to wire them; **Emil's guides**
(`references/`, vendored) say whether it feels right and how to review it.

## How to use

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
5. For taste, review and audit, read the matching guide in `references/` (table below).

The Ryoma values (presets, Lenis config, transition timings) are project-proven defaults: tune per project, but change
them deliberately and in one place. The vanilla adapter is new code written against the same preset contract.
Conventions are distilled from the Ryoma frontend (`ryoma-frontend`, `docs/`).

## Emil Kowalski guides

Pick by need: decide whether and how to animate → `emil-design-eng`, `animate`; review motion code → `review-animations`;
audit a codebase or find places worth animating → `improve-animations`, `find-animation-opportunities`; name an effect
precisely → `animation-vocabulary`; gestures, velocity, momentum → `apple-design`.

<!-- BEGIN TOPICS -->
| topic | use it when |
| --- | --- |
| [`emil-design-eng`](references/emil-design-eng.md) | This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. |
| [`animate`](references/animate.md) | Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, which tool, which properties, which curve and duration, how it interrupts, how it exits. Writes the implementation. Use when asked to animate something, add motion, make a component feel alive, or build a transition. For critiquing existing motion use [review-animations](references/review-animations.md); for auditing a whole codebase use [improve-animations](references/improve-animations.md). |
| [`review-animations`](references/review-animations.md) | Reviews animation and motion code against a high craft bar derived from Emil Kowalski's design engineering philosophy. Default to flagging; approval is earned. |
| [`improve-animations`](references/improve-animations.md) | Survey a codebase's animation and motion code as a senior motion advisor, then produce a prioritized audit and self-contained implementation plans for other agents (or cheaper models) to execute. Read-only on source code — it plans improvements, it does not apply them. Use when the user asks to "improve the animations", "audit the motion", "make this app feel better", or wants a roadmap of animation fixes rather than a review of a single diff. |
| [`find-animation-opportunities`](references/find-animation-opportunities.md) | Search a codebase or UI for places that don't animate but should, and reject everything that shouldn't. Read-only; it proposes motion with exact values, it does not implement it. Use when the user asks "what could be animated here?" or wants to "make this feel more alive". For fixing existing animations, use [improve-animations](references/improve-animations.md) or [review-animations](references/review-animations.md) instead. |
| [`animation-vocabulary`](references/animation-vocabulary.md) | Reverse-lookup glossary that turns a vague description of a web animation or motion effect into its exact term ("the bouncy thing when a popover opens" → Pop in; "the iOS rubber-band scroll" → Rubber-banding). Use when the user asks "what's it called when…", or describes a motion effect without knowing its name and wants the right word to prompt an AI or designer with. For naming an effect, not designing or building one. |
| [`apple-design`](references/apple-design.md) | Apple's approach to interface design and fluid, physical motion, translated for the web. Use when building or reviewing gesture-driven UI, spring animations, drag/swipe/sheet interactions, momentum and interruptible transitions, translucent materials and depth, typography (optical sizing, tracking, leading), reduced-motion, or the design foundations (feedback, spatial consistency, restraint) behind Apple-style interfaces. |
<!-- END TOPICS -->

## Source

`references/` is generated from `emilkowalski/skills` (MIT, © Emil Kowalski), vendored under `vendor/emil-skills`, by
`scripts/sync-vendored.mjs`. Do not edit it by hand. `rules/` is first-party.
