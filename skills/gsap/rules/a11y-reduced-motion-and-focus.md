# a11y-reduced-motion-and-focus

Why it matters: animation systems must respect reduced motion and maintain navigational clarity.

## Incorrect

```ts
gsap.from('.modal', { y: 60, opacity: 0, duration: 1.2 })
```

No reduced-motion fallback for potentially disorienting movement.

## Correct

```ts
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

gsap.from('.modal', {
  y: prefersReduced ? 0 : 24,
  opacity: 0,
  duration: prefersReduced ? 0.01 : 0.35,
})
```

## Guidance

- Provide reduced-motion alternatives for non-essential movement.
- Avoid motion that obscures focus context during keyboard navigation.
- Keep copy legible during text animation; do not hide essential content for long durations.

Docs:

- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
- https://gsap.com/resources/a11y
