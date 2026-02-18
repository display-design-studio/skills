# plugin-scrollsmoother-constraints

Why it matters: ScrollSmoother can conflict with layout assumptions and accessibility if applied globally without constraints.

## Incorrect

```ts
ScrollSmoother.create({ smooth: 2 })
```

No wrapper/content structure or fallback logic.

## Correct

```ts
ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1,
  effects: true,
})
```

## Guidance

- Always register `ScrollTrigger` + `ScrollSmoother`.
- Use explicit wrapper/content selectors matching docs structure.
- Validate fixed/sticky elements and nested scroll containers.
- Disable or reduce smoothing for reduced-motion users.

Docs:

- https://gsap.com/docs/v3/Plugins/ScrollSmoother
- https://gsap.com/docs/v3/Plugins/ScrollTrigger
