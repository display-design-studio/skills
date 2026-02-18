# plugin-svg-path-morph-quality

Why it matters: SVG animations fail visually when path complexity and coordinate alignment are not normalized.

## Incorrect

```ts
gsap.to('#shapeA', { morphSVG: '#shapeB', duration: 1 })
```

No preprocessing for incompatible shapes.

## Correct

```ts
MorphSVGPlugin.convertToPath('#shapeA, #shapeB')
gsap.to('#shapeA', {
  morphSVG: { shape: '#shapeB' },
  duration: 1,
  ease: 'power2.inOut',
})
```

## Guidance

- Convert source shapes to paths before morphing.
- Reduce path complexity when possible for smoother runtime.
- For motion paths, align and auto-rotate intentionally.
- Keep MotionPathHelper for authoring/debug, not default production runtime.

Docs:

- https://gsap.com/docs/v3/Plugins/MorphSVGPlugin
- https://gsap.com/docs/v3/Plugins/MotionPathPlugin
- https://gsap.com/docs/v3/Plugins/DrawSVGPlugin
- https://gsap.com/docs/v3/Plugins/MotionPathHelper
