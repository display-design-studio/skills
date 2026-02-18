# debug-iteration-workflow

Why it matters: animation bugs are often timing/trigger bugs that need structured iteration.

## Recommended workflow

1. Build minimal timeline/plugin setup.
2. Enable debug aids (`markers`, console diagnostics, GSDevTools where useful).
3. Confirm trigger boundaries and lifecycle cleanup.
4. Tune easing/duration only after logic is correct.
5. Remove debug artifacts before merge.

## Helpful debug tools

- `ScrollTrigger` markers
- `GSDevTools.create()` for timeline inspection
- `getVelocity`, `labelToScroll`, `getById`, `getTweensOf` for diagnosis

## Guidance

- Keep temporary debug code localized and easy to strip.
- Prefer deterministic scenarios (disable randomness) while debugging.
- Verify behavior on at least one touch and one desktop context for scroll/gesture features.

Docs:

- https://gsap.com/docs/v3/Plugins/GSDevTools
- https://gsap.com/docs/v3/Plugins/ScrollTrigger
