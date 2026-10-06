# Gotchas

Collected from the Ryoma build.

| Symptom | Cause | Fix |
| --- | --- | --- |
| Reveals already played when a new page appears | Scroll not reset before mount, `once` triggers fired off-screen | Reset scroll while the cover is opaque, before mount; force `top: 0` on back/forward ([page-transitions](page-transitions.md)) |
| Footer / last row never reveals | Standard `start` stays below the viewport at max scroll | Lower start, e.g. `top 98%` |
| Title is visible outside its box or box grows | Reveal on the clipping wrapper, or margins on the animated element | Reveal on the inner element; margins on the wrapper |
| Grid animates all at once at the top | `stagger` used on a long grid | Per-card `card` preset, one trigger each |
| White strip under the footer when overscrolling | Elastic overscroll | `overscroll: false` + `html.lenis { overscroll-behavior-y: none }` |
| Empty gap above a strip | Optional heading renders its padding without content | Render heading and padding only when content exists |
| Triggers misaligned after images/fonts load | Layout changed after trigger measurement | `ScrollTrigger.refresh()` after load/fonts ready/route mount |
| Triggers lag behind smooth scroll | Lenis not wired to ScrollTrigger | `lenis.on('scroll', ScrollTrigger.update)` and ticker integration |
| Stutter after tab switch | `lagSmoothing` compensating | `gsap.ticker.lagSmoothing(0)` with Lenis |
| Duplicate triggers after HMR | No teardown | Revert contexts, destroy Lenis, remove ticker callbacks |
| Flash of visible content before the hidden state applies | JS hides elements late | Acceptable by design (content stays visible without JS); init as early as possible, never hide in CSS unconditionally |
