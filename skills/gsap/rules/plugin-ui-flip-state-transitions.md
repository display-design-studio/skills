# plugin-ui-flip-state-transitions

Why it matters: FLIP preserves continuity across layout changes and avoids jarring state jumps.

## Incorrect

```ts
item.classList.toggle('expanded')
gsap.from(item, { scale: 0.8, duration: 0.3 })
```

This ignores pre/post-layout diffing.

## Correct

```ts
const state = Flip.getState('.card')
item.classList.toggle('expanded')
Flip.from(state, {
  duration: 0.5,
  ease: 'power2.inOut',
  absolute: true,
})
```

## Guidance

- Capture state before DOM/layout mutation.
- Apply mutation.
- Run `Flip.from(...)` with coherent duration/ease.
- Use batching for groups of related changes.

Docs:

- https://gsap.com/docs/v3/Plugins/Flip
