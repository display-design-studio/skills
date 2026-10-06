# Smooth scroll (Lenis + GSAP)

Lenis provides the smoothing; GSAP's ticker is the single animation loop; ScrollTrigger follows Lenis.

```ts
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 1,
  easing: (t) => 1 - Math.pow(1 - t, 5),
  lerp: 0,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  syncTouch: false,
  infinite: false,
  overscroll: false,
  autoResize: true,
})

const tick = (time: number) => lenis.raf(time * 1000)
gsap.ticker.add(tick)
gsap.ticker.lagSmoothing(0)
lenis.on('scroll', ScrollTrigger.update)

// teardown (HMR, unmount, tests)
// gsap.ticker.remove(tick); lenis.destroy()
```

## Rules
- **Ticker, not own RAF.** `lenis.raf(time * 1000)` inside `gsap.ticker`; GSAP ticker time is in seconds, Lenis
  expects milliseconds.
- **`lagSmoothing(0)`** so scroll and tweens don't jump after a stalled frame.
- **`lenis.on('scroll', ScrollTrigger.update)`** so triggers track the smoothed position.
- **No elastic overscroll.** `overscroll: false` plus CSS on the Lenis root:

  ```css
  html.lenis { overscroll-behavior-y: none; }
  ```

  Without it, the bounce past the footer can reveal a white strip.
- **Reduced motion:** do not create Lenis at all; scroll stays native. Expose the instance as `null` so
  consumers must handle it.
- **HMR / teardown:** remove the ticker callback and destroy the instance.
- Values come from the Linea Light–inspired tuning; they are defaults, change them per project in one place.

## Programmatic scroll
Use `lenis.scrollTo(0, { immediate: true })` when you need an instant jump (e.g. page transitions), and
`lenis.stop()` / `lenis.start()` to pause during overlays. Fall back to `window.scrollTo` when `lenis` is `null`.
