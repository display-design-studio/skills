# core-easing-strategy

Why it matters: inconsistent easing creates noisy UX and weak motion language.

## Incorrect

```ts
gsap.to('.panel', { x: 40, ease: 'bounce.out' })
gsap.to('.cta', { y: -4, ease: 'elastic.out(1, 0.2)' })
gsap.to('.card', { opacity: 1, ease: 'steps(8)' })
```

Heavy eases used indiscriminately reduce readability and polish.

## Correct

```ts
gsap.defaults({ ease: 'power2.out' })
gsap.to('.panel', { x: 40 })
gsap.to('.cta', { y: -4, ease: 'back.out(1.2)' })
gsap.to('.card', { opacity: 1, duration: 0.3 })
```

## Guidance

- Use one default ease family for most UI movement.
- Reserve bounce/elastic/rough eases for explicit, playful interactions.
- Create named custom eases for brand-consistent motion systems.
- Favor transform/opacity animations for smooth rendering.

Docs:

- https://gsap.com/docs/v3/Eases
- https://gsap.com/docs/v3/Eases/CustomEase
- https://gsap.com/docs/v3/GSAP/CorePlugins/CSS
