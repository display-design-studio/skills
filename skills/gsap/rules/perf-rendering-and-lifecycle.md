# perf-rendering-and-lifecycle

Why it matters: animation smoothness and stability depend on rendering choices and teardown discipline.

## Incorrect

```ts
gsap.to('.panel', { top: 200, left: 120, width: '70%', duration: 1 })
```

Frequent layout-triggering property updates can degrade performance.

## Correct

```ts
gsap.to('.panel', { x: 120, y: 200, scaleX: 0.7, duration: 1 })
```

## Guidance

- Prefer transforms and opacity for high-frequency animation.
- Avoid unnecessary animation recreation in rerender loops.
- Kill/revert instances and plugin observers on teardown.
- Refresh scroll scenes after DOM/layout changes.
- Profile long pages and large stagger sets on mid/low-end devices.

Docs:

- https://gsap.com/docs/v3/GSAP/CorePlugins/CSS
- https://gsap.com/docs/v3/GSAP/gsap.context()
- https://gsap.com/docs/v3/Plugins/ScrollTrigger
