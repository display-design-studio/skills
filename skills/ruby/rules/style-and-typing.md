# style-and-typing

Why it matters: consistent style keeps large Ruby codebases readable across contributors, and Ruby's opt-in type-checking tools (RBS/Sorbet) catch a class of bugs static languages get for free — but only if configured and actually run in CI.

## RuboCop (linting + formatting)

```bash
gem install rubocop     # or add to Gemfile :development group
rubocop                 # lint the whole project
rubocop app/models/user.rb
rubocop -A               # auto-correct everything RuboCop is confident about (safe + unsafe)
rubocop -a                # auto-correct only SAFE offenses
rubocop --regenerate-todo  # bulk-record existing offenses instead of fixing them all at once
```

```yaml
# .rubocop.yml
require:
  - rubocop-rails
  - rubocop-rspec

AllCops:
  NewCops: enable
  TargetRubyVersion: 3.3

Style/Documentation:
  Enabled: false

Metrics/MethodLength:
  Max: 15
```

- Adopt a base config instead of hand-tuning every cop: `rubocop-shopify`,
  `rubocop-github`, or the default RuboCop + `rubocop-rails`/`rubocop-rspec` extensions for
  framework-specific cops.
- Run `rubocop --regenerate-todo` when adopting RuboCop on an existing codebase — it
  freezes current offenses in `.rubocop_todo.yml` so new code is held to the standard
  without a giant one-time fixup PR.

## Style Guides (source of truth for conventions, not enforced automatically)

- https://rubystyle.guide/ — community Ruby style guide (what RuboCop's defaults are based on)
- https://ruby-style-guide.shopify.dev/ — Shopify's guide, geared to large Rails codebases
- https://github.com/airbnb/ruby — Airbnb's guide

Key conventions worth internalizing: two-space indentation, snake_case for
methods/variables, CamelCase for classes/modules, SCREAMING_SNAKE_CASE for constants,
`?` suffix for predicate methods (`valid?`), `!` suffix only for the "dangerous"
counterpart of a same-named safe method (`save!` vs `save`), not just "any mutation".

## Type Signatures — RBS (stdlib, Ruby's own type system)

```ruby
# sig/calculator.rbs
class Calculator
  def add: (Integer, Integer) -> Integer
  def divide: (Integer, Integer) -> Float
end
```

```bash
gem install rbs
rbs validate                # check .rbs files are well-formed
steep check                 # type-check the code against the .rbs signatures (needs Steep)
```

## Steep (static type checker using RBS)

```yaml
# Steepfile
target :lib do
  signature "sig"
  check "lib"
end
```

## Sorbet (alternative, inline type annotations)

```ruby
# typed: true
extend T::Sig

sig { params(a: Integer, b: Integer).returns(Integer) }
def add(a, b)
  a + b
end
```

Choose **RBS + Steep** for gems/stdlib-aligned projects (signatures live outside the code,
no runtime cost); choose **Sorbet** when you want inline signatures and a mature Rails
integration (`sorbet-rails`) with fast incremental type-checking (`srb tc`).

## Editor Tooling — ruby-lsp

```ruby
# Gemfile
group :development do
  gem "ruby-lsp", require: false
end
```

`ruby-lsp` (from Shopify) provides go-to-definition, autocomplete, inline diagnostics, and
formatting integration for VS Code/Zed/Neovim — it auto-detects RuboCop/Sorbet/RBS in the
project and wires them into the editor without separate per-tool plugins.

## Docs

- https://rubystyle.guide/
- https://docs.rubocop.org/rubocop/
- https://github.com/ruby/rbs
- https://github.com/soutaro/steep
- https://github.com/Shopify/ruby-lsp
