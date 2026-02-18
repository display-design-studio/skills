# plugin-text-splitting-lifecycle

Why it matters: text splitting mutates DOM structure and can leak/re-split incorrectly without lifecycle cleanup.

## Incorrect

```ts
const split = SplitText.create('.headline', { type: 'chars' })
gsap.from(split.chars, { yPercent: 120, stagger: 0.01 })
// no revert
```

## Correct

```ts
const split = SplitText.create('.headline', { type: 'lines,words,chars' })
const tl = gsap.timeline()
tl.from(split.chars, { yPercent: 120, stagger: 0.01, duration: 0.6 })

// later on teardown
split.revert()
```

## Guidance

- Revert split structures on teardown/navigation when appropriate.
- Limit split granularity for large text blocks to avoid heavy DOM inflation.
- Re-split only when line wraps actually change.

Docs:

- https://gsap.com/docs/v3/Plugins/SplitText
- https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin
- https://gsap.com/docs/v3/Plugins/TextPlugin
