# core-timeline-orchestration

Why it matters: predictable sequencing and maintainability depend on position parameters, labels, and defaults.

## Incorrect

```ts
gsap.to('.one', { x: 120, delay: 0 })
gsap.to('.two', { x: 120, delay: 1.15 })
gsap.to('.three', { x: 120, delay: 2.3 })
```

Hard-coded delays become brittle during iteration.

## Correct

```ts
const tl = gsap.timeline({ defaults: { duration: 1, ease: 'power2.out' } })

tl.addLabel('start', 0)
  .to('.one', { x: 120 }, 'start')
  .to('.two', { x: 120 }, 'start+=0.15')
  .to('.three', { x: 120 }, 'start+=0.3')
```

## Guidance

- Prefer labels over magic delays for semantic timing anchors.
- Use timeline defaults to reduce duplication.
- Use relative positions (`+=` / `-=`) for intentional overlaps and gaps.
- Split giant timelines into nested sub-timelines by section/interaction.

Docs:

- https://gsap.com/docs/v3/GSAP/Timeline
- https://gsap.com/resources/position-parameter
