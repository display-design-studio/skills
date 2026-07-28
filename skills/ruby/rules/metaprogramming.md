# metaprogramming

Why it matters: Ruby's metaprogramming is what makes Rails, RSpec, and most Ruby DSLs possible — but it's also the easiest way to write code that's unreadable, unsafe (`eval` on untrusted input), or breaks tooling (autocomplete, static analysis). Use it deliberately, and prefer the safest tool that solves the problem.

## `define_method` (preferred over `eval`-based method definition)

```ruby
class Product
  %i[name price description].each do |attr|
    define_method(attr) { instance_variable_get("@#{attr}") }
    define_method("#{attr}=") { |value| instance_variable_set("@#{attr}", value) }
  end
end
```

- `define_method` takes a block/lambda/symbol, so it's closure-aware and doesn't require
  string interpolation into executable code — always prefer it over `class_eval("def ...")`.

## `instance_eval` / `class_eval` (for building DSLs)

```ruby
class Recipe
  attr_reader :ingredients
  def initialize
    @ingredients = []
  end

  def ingredient(name, amount)
    @ingredients << { name: name, amount: amount }
  end
end

def recipe(&block)
  Recipe.new.tap { |r| r.instance_eval(&block) }
end

recipe do
  ingredient "flour", "2 cups"
  ingredient "sugar", "1 cup"
end
```

```ruby
# class_eval — reopen a class and add behavior dynamically (e.g. in a gem/plugin system)
String.class_eval do
  def shout
    upcase + "!"
  end
end
```

- `instance_eval` changes `self` inside the block to the receiver — this is how config
  blocks (`Rails.application.configure do ... end`, RSpec's `describe do ... end`) work.
- Prefer passing the receiver as a block argument (`instance_exec`) over `instance_eval`
  when you also want the block to have access to variables from its original `self`.

## `method_missing` + Dynamic Dispatch — see `core-oop-modules.md`

Covered there since it's primarily an OOP-design tool; use it only when the surface area of
dynamic methods truly can't be known at class-definition time.

## Class Macros (the pattern behind `attr_accessor`, `has_many`, `validates`)

```ruby
module Trackable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def track(*fields)
      fields.each do |field|
        define_method("track_#{field}") { Analytics.record(field, send(field)) }
      end
    end
  end
end

class Order
  include Trackable
  track :total, :status   # a class-level "macro" call, just like Rails' `validates :email`
end
```

This `self.included(base)` + `extend ClassMethods` pattern is exactly how Rails
implements `has_many`, `validates`, and similar declarative class-level APIs — recognize
it when reading Rails/gem internals, and reach for it when you need your own class-level
DSL.

## Refinements (scoped monkey-patching)

```ruby
module StringExtras
  refine String do
    def shout
      upcase + "!"
    end
  end
end

class Greeter
  using StringExtras          # only active within this file/scope
  def greet(name) = name.shout
end
```

Prefer refinements over global `class_eval` monkey-patches on core classes (`String`,
`Array`) in shared/library code — they avoid silently changing behavior for every gem in
the process.

## Safety Rules

- Never call `eval`/`instance_eval`/`class_eval` with a **string** built from user input —
  this is arbitrary code execution. If you must build code as a string, keep it fully
  static (no interpolated request data).
- Prefer `send`/`public_send` over `eval` for dynamic dispatch; use `public_send` unless
  you specifically need to call private methods.
- Add a comment explaining *why* whenever metaprogramming is used for anything beyond a
  simple attribute-generation loop — it isn't discoverable by grep the way explicit methods are.

## Docs

- https://docs.ruby-lang.org/en/master/Module.html
- https://docs.ruby-lang.org/en/master/doc/syntax/refinements_rdoc.html
- https://pragprog.com/titles/ppmetr2/metaprogramming-ruby-2/
