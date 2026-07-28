# Ruby Rule Sections

This skill is divided by Ruby-language categories, independent of any framework.

## 1) Core Language (`core-`)

Always start here for orientation or general Ruby tasks:

- `core-syntax-and-types.md` — variables, symbols, strings, numerics, control flow, pattern matching
- `core-collections-enumerable.md` — Array, Hash, Struct/Data, Enumerable, lazy enumerators
- `core-blocks-procs-lambdas.md` — blocks, `yield`, `Proc` vs `lambda`, closures
- `core-oop-modules.md` — classes, modules, mixins (`include`/`extend`/`prepend`), `method_missing`

## 2) Metaprogramming

Load when reading/writing DSLs, class macros, or dynamic method generation:

- `metaprogramming.md` — `define_method`, `instance_eval`/`class_eval`, refinements, safety rules

## 3) Dependency Management

Load when touching a Gemfile or building a gem:

- `gems-and-bundler.md` — Bundler workflow, groups, building/publishing gems

## 4) Testing (`testing-`)

Load when writing or fixing tests:

- `testing-rspec-minitest.md` — Minitest (stdlib) vs RSpec, doubles/mocks, shared examples

## 5) Style & Typing

Load when configuring linting/formatting/type-checking:

- `style-and-typing.md` — RuboCop, style guides, RBS/Steep/Sorbet, ruby-lsp

## 6) Performance & Debugging

Load when profiling, debugging, or tuning:

- `performance-and-debugging.md` — debug/pry/irb, GC tuning, YJIT, stackprof/memory_profiler

## Suggested reading order

1. `core-syntax-and-types.md` (orientation)
2. `core-collections-enumerable.md`
3. `core-blocks-procs-lambdas.md`
4. `core-oop-modules.md`
5. `metaprogramming.md` (only for DSL/advanced work)
6. `gems-and-bundler.md`
7. `testing-rspec-minitest.md`
8. `style-and-typing.md` + `performance-and-debugging.md`
