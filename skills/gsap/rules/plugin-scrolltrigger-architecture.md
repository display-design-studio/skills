# plugin-scrolltrigger-architecture

Why it matters: ScrollTrigger can become fragile without clear trigger ownership and refresh strategy.

## Incorrect

```ts
gsap.utils.toArray('.section').forEach((el) => {
  gsap.to(el, {
    y: -120,
    scrollTrigger: { trigger: '.page', scrub: true },
  })
})
```

All sections depend on the same trigger, reducing precision.

## Correct

```ts
gsap.utils.toArray<HTMLElement>('.section').forEach((el) => {
  gsap.to(el, {
    y: -120,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      end: 'bottom 15%',
      scrub: true,
    },
  })
})
```

## Guidance

- Use per-element triggers unless a shared trigger is intentional.
- Turn on `markers` while authoring complex scenes.
- Call `ScrollTrigger.refresh()` after dynamic DOM/layout changes.
- Use `ScrollTrigger.matchMedia()` for responsive trigger variants.

Docs:

- https://gsap.com/docs/v3/Plugins/ScrollTrigger
