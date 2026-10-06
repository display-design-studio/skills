# Reduced motion and cleanup

## Reduced motion
Use `gsap.matchMedia` so tweens are created only when motion is allowed, and are **reverted and restored
automatically** when the user toggles the OS setting.

```ts
const mm = gsap.matchMedia()
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // create tweens + ScrollTriggers here
})
// teardown: mm.revert()
```

Per feature:
- **Scroll reveals:** not created; content is simply visible.
- **Lenis:** not created; native scroll.
- **Page transition:** fades skipped, scroll reset kept.

Reduced motion means *less and gentler*, not zero (Emil's guidance): opacity and color changes are fine,
large movement is not. Our scroll reveals are skipped entirely because they are decorative.
Also gate hover-only effects with `@media (hover: hover) and (pointer: fine)`.

## Cleanup
- **Per-element ownership.** Each reveal knows which tween/trigger it created and kills only those on unmount.
  Never `ScrollTrigger.killAll()` from a component.
- **Contexts.** Prefer `gsap.context()` / `matchMedia` and `revert()` them; this restores inline styles too.
- **Route change.** Kill reveals of the outgoing page; refresh ScrollTrigger after the new one mounts.
- **HMR.** Remove ticker callbacks, destroy Lenis, revert contexts, free the page-transition overlay.
- **SSR.** Register client-only plugins on the client; on the server register only a no-op stub for
  directives/APIs that templates reference.
