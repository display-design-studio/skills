# core-animation-model

Why it matters: most GSAP issues come from unclear boundaries between standalone tweens, timelines, and lifecycle cleanup.

## Incorrect

```ts
gsap.to('.a', { x: 80 })
gsap.to('.a', { y: 40, delay: 0.2 })
gsap.to('.a', { rotate: 20, delay: 0.4 })
```

This creates fragmented choreography and makes control/cancel logic harder.

## Correct

```ts
const tl = gsap.timeline({ defaults: { duration: 0.4, ease: 'power2.out' } })
tl.to('.a', { x: 80 })
  .to('.a', { y: 40 }, '+=0.2')
  .to('.a', { rotate: 20 }, '+=0.2')
```

Use timelines for any sequence with more than one meaningful step.

## Guidance

- Use `gsap.to/from/fromTo/set` for simple one-off interactions.
- Promote to timeline as soon as sequencing or shared control is needed.
- Keep references to tween/timeline instances if you need to pause/restart/kill later.

Docs:

- https://gsap.com/docs/v3/GSAP/
- https://gsap.com/docs/v3/GSAP/Tween
- https://gsap.com/docs/v3/GSAP/Timeline
