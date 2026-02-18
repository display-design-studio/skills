# tools-utils-function-pipelines

Why it matters: `gsap.utils` function composition removes repetitive math and keeps tween values deterministic.

## Incorrect

```ts
gsap.to('.dot', {
  x: (_, i) => Math.min(300, Math.max(0, i * 27.5)),
})
```

Hard-to-read custom math duplicated across animations.

## Correct

```ts
const xPipe = gsap.utils.pipe(
  gsap.utils.mapRange(0, 20, 0, 320),
  gsap.utils.clamp(0, 300),
  gsap.utils.snap(4),
)

gsap.to('.dot', {
  x: (_, i) => xPipe(i),
})
```

## Guidance

- Prefer composable utility pipelines over one-off math expressions.
- High-value methods: `clamp`, `mapRange`, `normalize`, `pipe`, `snap`, `wrap`, `unitize`.
- Use `selector(root)` to scope queries.

Docs:

- https://gsap.com/docs/v3/GSAP/UtilityMethods
