# Vanilla JS adapter

Same preset contract as Nuxt, driven by a data attribute. This adapter is new code written against the Ryoma
preset values (it does not exist in the Ryoma docs); test it in the target project.

## Markup

```html
<div class="overflow-hidden"><h2 data-reveal="title">Title</h2></div>
<p data-reveal="text">Text</p>
<article data-reveal="card">…</article>
<p data-reveal="text" data-reveal-delay="0.08">Delayed</p>
<ul data-reveal="stagger" data-reveal-start="top 98%">…</ul>
```

Attributes: `data-reveal` (preset, default `default`), `data-reveal-delay`, `data-reveal-start`,
`data-reveal-duration`, `data-reveal-stagger`.

## `reveal.js`

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const base = { ease: 'power4.out', duration: 1.1 }
const PRESETS = {
  default: { from: { y: 48, opacity: 0 }, to: { y: 0, opacity: 1 }, ...base, start: 'top 88%' },
  text:    { from: { y: 48, opacity: 0 }, to: { y: 0, opacity: 1 }, ...base, start: 'top 88%' },
  title:   { from: { yPercent: 105 }, to: { yPercent: 0 }, duration: 1.25, ease: 'expo.out', start: 'top 92%' },
  image:   { from: { y: 60, opacity: 0, scale: 0.985 }, to: { y: 0, opacity: 1, scale: 1 }, ...base, duration: 1.2, start: 'top 90%' },
  card:    { from: { y: 60, opacity: 0, scale: 0.985 }, to: { y: 0, opacity: 1, scale: 1 }, ...base, duration: 1.2, start: 'top 90%' },
  stagger: { from: { y: 48, opacity: 0 }, to: { y: 0, opacity: 1 }, ...base, start: 'top 88%', stagger: 0.08, children: true },
  fade:    { from: { opacity: 0 }, to: { opacity: 1 }, ...base, start: 'top 90%' },
}

const num = (v, fallback) => (v === undefined || v === '' ? fallback : Number(v))

/** Create reveals for every [data-reveal] under `root`. Returns destroy(). */
export function initReveal(root = document) {
  const mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      const p = PRESETS[el.dataset.reveal] ?? PRESETS.default
      const targets = p.children ? Array.from(el.children) : el
      if (p.children && !targets.length) return

      gsap.fromTo(targets, p.from, {
        ...p.to,
        duration: num(el.dataset.revealDuration, p.duration),
        delay: num(el.dataset.revealDelay, 0),
        ease: p.ease,
        stagger: p.children ? num(el.dataset.revealStagger, p.stagger) : 0,
        scrollTrigger: {
          trigger: el,
          start: el.dataset.revealStart ?? p.start,
          once: true,
          toggleActions: 'play none none none',
        },
      })
    })
  })

  // revert() kills tweens + triggers created inside and restores inline styles
  return () => mm.revert()
}
```

## `smooth-scroll.js`

```js
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initSmoothScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null // native scroll

  const lenis = new Lenis({ duration: 1, easing: (t) => 1 - Math.pow(1 - t, 5), lerp: 0, overscroll: false })
  const tick = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  lenis.on('scroll', ScrollTrigger.update)

  lenis.destroyAll = () => { gsap.ticker.remove(tick); lenis.destroy() }
  return lenis
}
```

Add `html.lenis { overscroll-behavior-y: none; }` to the CSS (see [smooth-scroll](../smooth-scroll.md)).

## Boot

```js
import { initReveal } from './reveal.js'
import { initSmoothScroll } from './smooth-scroll.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

history.scrollRestoration = 'manual'
const lenis = initSmoothScroll()
const destroyReveal = initReveal()

// after fonts/images affect layout:
document.fonts?.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => ScrollTrigger.refresh())
```

## Client-side navigation (SPA-like, e.g. Barba/Swup/htmx)
After swapping the DOM: `destroyReveal()` → reset scroll while covered → `initReveal(newContainer)` →
`ScrollTrigger.refresh()` → uncover. See [page-transitions](../page-transitions.md).

## Conventions
- No-JS: markup is fully visible; only `initReveal` applies hidden states.
- Don't add CSS that hides `[data-reveal]` by default.
- Keep `PRESETS` in one module; if you also use Nuxt elsewhere, copy the same values from
  [reveal-presets](../reveal-presets.md) so sites behave identically.
