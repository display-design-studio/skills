# Page transitions

A full-site cover (including header and footer) hides the route swap. The invariant that matters:
**scroll must be at the top before the new page mounts**, otherwise `once` reveals fire off-screen and are
consumed.

## Sequence

1. **Cover.** Stop Lenis. Fade a full-viewport overlay from transparent to opaque: `0.45s`, `power2.inOut`.
2. **Reset while covered.** Jump Lenis and native scroll to `top: 0` immediately (`immediate: true`), *before*
   the destination mounts.
3. **Mount.** The router renders the new page. Scroll restoration must be forced to top, including for
   back/forward (ignore saved positions).
4. **Reveal.** After the page has loaded: confirm top position again, `ScrollTrigger.refresh()`, fade the
   overlay out `0.6s`, `power2.out`, then restart Lenis.

Timings are defaults; keep the cover faster than the reveal.

## Edge cases
- Apply only to **route changes**. Same-page hash links keep scrolling to the anchor.
- **First load:** no overlay.
- **Reduced motion:** skip both fades, **keep** the scroll reset.
- **Navigation failure:** release the overlay and restart Lenis, or the site stays covered.
- **HMR:** remove guards, hooks and tweens.

## Per stack
- **SPA / Nuxt:** hook into the router's before/after navigation and the page-loaded hook. See
  [adapters/nuxt](adapters/nuxt.md).
- **MPA (vanilla):** on internal link click → run step 1, then `location.href = url`. On the next page load,
  start with the overlay opaque, run step 4 once content and fonts are ready. Browsers restore scroll on
  back/forward: set `history.scrollRestoration = 'manual'` and scroll to top on load. See
  [adapters/vanilla](adapters/vanilla.md).
