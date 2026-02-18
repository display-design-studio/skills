# plugin-draggable-inertia-constraints

Why it matters: unconstrained dragging/inertia causes unstable interaction and difficult-to-debug state.

## Incorrect

```ts
Draggable.create('.knob', { type: 'x,y', inertia: true })
```

No bounds, axis policy, or cleanup.

## Correct

```ts
const drag = Draggable.create('.knob', {
  type: 'x',
  bounds: '.track',
  inertia: true,
  onDragEnd() {
    // sync model state here
  },
})

// later
drag[0].kill()
```

## Guidance

- Define bounds/axis intentionally.
- Keep drag state and app state synchronized at explicit hooks.
- Kill draggable instances on teardown.
- Use `Observer` for lower-level intent detection when Draggable is not a fit.

Docs:

- https://gsap.com/docs/v3/Plugins/Draggable
- https://gsap.com/docs/v3/Plugins/InertiaPlugin
- https://gsap.com/docs/v3/Plugins/Observer
