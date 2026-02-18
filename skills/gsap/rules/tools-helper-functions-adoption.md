# tools-helper-functions-adoption

Why it matters: helper recipes accelerate advanced features, but should be adopted intentionally.

## Incorrect

```ts
// copy/paste large helper bundle directly into app bootstrap
```

Blindly importing helpers increases complexity and maintenance burden.

## Correct

```ts
// select one helper pattern and adapt only what is needed
// example: debounced refresh after resize for ScrollTrigger scenes
```

## Guidance

- Treat helper functions as reference implementations.
- Extract only needed parts with project naming/style.
- Validate browser/device behavior (especially touch/scroll helpers).
- Keep attribution where applicable.

Notable helpers from docs catalog:

- `seamlessLoop`
- `callAfterResize`
- `getDirectionalSnapFunc`
- `LottieScrollTrigger`
- `killChildTweensOf`

Docs:

- https://gsap.com/docs/v3/HelperFunctions
