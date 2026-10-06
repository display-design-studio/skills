# Reveal presets

The shared contract between adapters. Adapters expose these names; values are defined once.

| Preset | Initial state | Duration | Ease | Start |
| --- | --- | --- | --- | --- |
| `default` | `y: 48`, `opacity: 0` | 1.1s | `power4.out` | `top 88%` |
| `text` | `y: 48`, `opacity: 0` | 1.1s | `power4.out` | `top 88%` |
| `title` | `yPercent: 105` (mask reveal) | 1.25s | `expo.out` | `top 92%` |
| `image` | `y: 60`, `opacity: 0`, `scale: 0.985` | 1.2s | `power4.out` | `top 90%` |
| `card` | `y: 60`, `opacity: 0`, `scale: 0.985` | 1.2s | `power4.out` | `top 90%` |
| `stagger` | `y: 48`, `opacity: 0` on **direct children** | 1.1s | `power4.out` | `top 88%` |
| `fade` | `opacity: 0` | 1.1s | `power4.out` | `top 90%` |

- Default stagger: `0.08`s. Overrides allowed per use: `duration`, `delay`, `start`, `stagger`.
- All presets: `toggleActions: 'play none none none'`, `once: true`, end state is the natural position
  (`y: 0`, `yPercent: 0`, `opacity: 1`, `scale: 1`).
- Origin of the numbers: the initial brief targeted a Linea Light–style feel (`y` 40–60, 1.0–1.2s,
  `power4.out`, stagger 0.06–0.1, start `top 85–90%`). `title` was changed from a `yPercent: 35` fade to a
  `yPercent: 105` mask reveal with `expo.out`.

## Usage rules

### Titles use a mask
Wrap the animated element in a container with `overflow: hidden`. The title rises from below without being
visible outside its own box.

```html
<div class="overflow-hidden">
  <h2 data-reveal="title">Heading</h2>
</div>
```

- Never move the reveal onto the clipping wrapper.
- Put the title's outer margins on the wrapper, otherwise the mask grows.
- Tight line-heights can clip descenders: add small vertical padding on the wrapper if needed.

### Stagger vs per-element trigger
- `stagger`: only for **short, related elements that enter together** (a list of three links, a row of meta).
- A grid that spreads down the page: put `card` on **each** card. Each gets its own trigger, so cards further
  down animate when *they* arrive, not all at once at the top.

### Bottom of the page
A standard `start` can stay below the viewport even at maximum scroll (footer rows). Override with a lower
start, e.g. `stagger` with `start: 'top 98%'`.

### Optional blocks
If a reveal wraps an optional heading, render the heading *and its padding* only when the content exists, so
no empty whitespace appears (e.g. a logo strip with `fade` and an optional title).

## Reference implementation (core of any adapter)

```ts
const base = { ease: 'power4.out', duration: 1.1 }
export const PRESETS = {
  default: { from: { y: 48, opacity: 0 }, to: { y: 0, opacity: 1 }, ...base, start: 'top 88%' },
  text:    { from: { y: 48, opacity: 0 }, to: { y: 0, opacity: 1 }, ...base, start: 'top 88%' },
  title:   { from: { yPercent: 105 }, to: { yPercent: 0 }, duration: 1.25, ease: 'expo.out', start: 'top 92%' },
  image:   { from: { y: 60, opacity: 0, scale: 0.985 }, to: { y: 0, opacity: 1, scale: 1 }, ...base, duration: 1.2, start: 'top 90%' },
  card:    { from: { y: 60, opacity: 0, scale: 0.985 }, to: { y: 0, opacity: 1, scale: 1 }, ...base, duration: 1.2, start: 'top 90%' },
  stagger: { from: { y: 48, opacity: 0 }, to: { y: 0, opacity: 1 }, ...base, start: 'top 88%', stagger: 0.08, children: true },
  fade:    { from: { opacity: 0 }, to: { opacity: 1 }, ...base, start: 'top 90%' },
} as const
```
