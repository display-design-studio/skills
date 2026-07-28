---
name: ruby
description: >-
  Core Ruby language best-practices skill (Ruby 3.3/4.0) covering syntax and
  types, collections/Enumerable, blocks/procs/lambdas, OOP and modules,
  metaprogramming, Bundler/gems, testing (RSpec/Minitest), style/typing
  tooling (RuboCop, RBS, Steep, ruby-lsp), and performance/debugging. Use
  when the user mentions Ruby, gem, Bundler, Gemfile, RSpec, Minitest,
  RuboCop, irb, pry, blocks, procs, lambdas, mixins, or module/metaprogramming
  patterns that are not specific to a framework. For Ruby on Rails
  framework-specific questions (Active Record, routing, Action View, etc.),
  see the sibling `ruby-on-rails` skill instead.
---

# Ruby Best Practices

Core Ruby language guide organized as modular rules, independent of any web framework. Covers syntax and types, collections, blocks/procs/lambdas, OOP/modules, metaprogramming, dependency management, testing, style/typing tooling, and performance/debugging.

For Rails-specific concerns (Active Record, controllers, views, jobs, Kamal deployment, etc.), load the sibling `ruby-on-rails` skill instead.

## ROUTING: Which rule file to load

**IF working with variables, strings/symbols, numerics, control flow, or pattern matching (`case/in`):**
→ Read `rules/core-syntax-and-types.md`

**IF working with Array, Hash, Struct, Enumerable, or lazy enumerators:**
→ Read `rules/core-collections-enumerable.md`

**IF working with blocks, `yield`, `Proc`, or `lambda`:**
→ Read `rules/core-blocks-procs-lambdas.md`

**IF working with classes, modules, mixins, or inheritance:**
→ Read `rules/core-oop-modules.md`

**IF writing metaprogramming, DSLs, or dynamic method definitions:**
→ Read `rules/metaprogramming.md`

**IF managing dependencies, a Gemfile, or building/publishing a gem:**
→ Read `rules/gems-and-bundler.md`

**IF writing or fixing tests:**
→ Read `rules/testing-rspec-minitest.md`

**IF configuring linting, formatting, or type-checking tooling:**
→ Read `rules/style-and-typing.md`

**IF profiling, debugging, or tuning Ruby performance:**
→ Read `rules/performance-and-debugging.md`

## Rule index

| Topic | Description | File |
|-------|-------------|------|
| Sections overview | Categories and reading order | [rules/_sections.md](rules/_sections.md) |
| Syntax & Types | Variables, symbols, strings, numerics, control flow, pattern matching | [rules/core-syntax-and-types.md](rules/core-syntax-and-types.md) |
| Collections & Enumerable | Array, Hash, Struct, Enumerable, lazy enumerators | [rules/core-collections-enumerable.md](rules/core-collections-enumerable.md) |
| Blocks, Procs, Lambdas | Blocks, `yield`, closures, `Proc` vs `lambda` | [rules/core-blocks-procs-lambdas.md](rules/core-blocks-procs-lambdas.md) |
| OOP & Modules | Classes, modules, mixins, inheritance, `method_missing` | [rules/core-oop-modules.md](rules/core-oop-modules.md) |
| Metaprogramming | `define_method`, `instance_eval`/`class_eval`, DSLs, refinements | [rules/metaprogramming.md](rules/metaprogramming.md) |
| Gems & Bundler | Dependency management, building/publishing gems | [rules/gems-and-bundler.md](rules/gems-and-bundler.md) |
| Testing | Minitest vs RSpec, doubles, fixtures | [rules/testing-rspec-minitest.md](rules/testing-rspec-minitest.md) |
| Style & Typing | RuboCop, style guides, RBS/Steep/Sorbet, ruby-lsp | [rules/style-and-typing.md](rules/style-and-typing.md) |
| Performance & Debugging | irb/pry, GC tuning, YJIT, profiling | [rules/performance-and-debugging.md](rules/performance-and-debugging.md) |

## Rule categories by priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Core language | CRITICAL | `core-` |
| 2 | Metaprogramming | MEDIUM (advanced/DSL work) | (none) |
| 3 | Dependency management | HIGH | (none) |
| 4 | Testing | HIGH | `testing-` |
| 5 | Style & Typing | MEDIUM | (none) |
| 6 | Performance & Debugging | MEDIUM | (none) |

## Coverage and maintenance

- Coverage map: `rules/_coverage-map.md`
- Sources: https://www.ruby-lang.org/en/documentation/ (Ruby 4.0, with 3.3/master references) and https://rubystyle.guide/
- Update this skill when a new Ruby major/minor ships or when ruby-lang.org restructures its documentation page.

## Ruby CLI quick reference

```bash
ruby -v                       # print Ruby version
ruby -c file.rb                # syntax check only
ruby -w file.rb                 # run with verbose warnings
irb                            # interactive REPL
gem install pry && pry          # richer REPL (better introspection, editing)
bundle init                    # create a Gemfile
bundle install                 # install gems from Gemfile.lock
bundle exec rspec              # run RSpec inside the bundle's gem set
bundle exec rake test          # run Minitest via Rake
rubocop                        # lint/format check
rubocop -A                     # auto-correct safe + unsafe offenses
ri Array#each                  # look up stdlib docs from the CLI
```
