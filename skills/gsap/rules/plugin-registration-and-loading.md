# plugin-registration-and-loading

Why it matters: explicit plugin registration prevents integration bugs and tree-shaking issues.

## Incorrect

```ts
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// forgot gsap.registerPlugin(ScrollTrigger)

gsap.to('.box', { scrollTrigger: { trigger: '.box' }, x: 80 })
```

## Correct

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
```

## Guidance

- Register each plugin once before usage.
- Centralize plugin setup in one app-level module when possible.
- Use lazy loading only for rare/heavy plugin paths.
- Track plugin dependencies explicitly:
  - `ScrollSmoother` -> `ScrollTrigger`
  - `CustomWiggle` / `CustomBounce` -> `CustomEase`

Docs:

- https://gsap.com/docs/v3/Plugins
- https://gsap.com/docs/v3/GSAP/gsap.registerPlugin()
