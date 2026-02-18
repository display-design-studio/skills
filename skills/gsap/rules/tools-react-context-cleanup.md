# tools-react-context-cleanup

Why it matters: framework rerenders can duplicate animations unless setup and teardown are scoped.

## Incorrect

```ts
useEffect(() => {
  gsap.from('.item', { y: 20, opacity: 0 })
}, [])
```

Global selector and no scoped cleanup.

## Correct

```ts
const root = useRef<HTMLDivElement>(null)

useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.item', { y: 20, opacity: 0, stagger: 0.05 })
  }, root)
  return () => ctx.revert()
}, [])
```

## Guidance

- Scope selectors to component roots.
- Always clean up with `revert()`.
- Use `matchMedia()` for responsive variants.
- In SSR frameworks, execute DOM animation only on client lifecycle.

Docs:

- https://gsap.com/resources/React
- https://gsap.com/docs/v3/GSAP/gsap.context()
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()
