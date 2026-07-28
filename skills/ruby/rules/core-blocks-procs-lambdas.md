# core-blocks-procs-lambdas

Why it matters: blocks are Ruby's most distinctive feature — nearly every stdlib method and DSL (RSpec, Rails, Rake) is built on blocks/procs/lambdas. Confusing their return/arity semantics is a common source of subtle bugs.

## Blocks and `yield`

```ruby
def repeat(times)
  return enum_for(:repeat, times) unless block_given?

  times.times { |i| yield i }
end

repeat(3) { |i| puts "iteration #{i}" }
repeat(3).to_a   # => [0, 1, 2] — Enumerator when no block given (see enum_for pattern)
```

- Always check `block_given?` (or use `enum_for`) before calling `yield` if the block is optional.
- `enum_for(:method_name, *args)` returns a lazy `Enumerator` — the standard way to make a
  block-taking method also usable without a block (chainable with `.map`, `.lazy`, etc.).

## Capturing a Block Explicitly

```ruby
def repeat(times, &block)
  times.times(&block)
end

# &block converts the block into a Proc object you can store, pass along, or call directly
def with_logging(&block)
  puts "starting"
  result = block.call
  puts "done"
  result
end
```

Only capture with `&block` when you need to pass it along, store it, or call it multiple
times — otherwise plain `yield` is faster (no Proc object allocation).

## Proc vs Lambda

```ruby
add = Proc.new { |a, b| a + b }
add.call(1, 2)      # => 3
add.call(1)         # => nil for b, no ArgumentError — lenient arity

multiply = lambda { |a, b| a * b }
# multiply = ->(a, b) { a * b }   # equivalent "stabby lambda" syntax
multiply.call(1, 2)  # => 2
multiply.call(1)     # raises ArgumentError — strict arity, like a real method

# return semantics differ:
def proc_test
  p = Proc.new { return 10 }   # `return` inside a Proc returns from the ENCLOSING method
  p.call
  20                            # never reached
end

def lambda_test
  l = lambda { return 10 }     # `return` inside a lambda only returns from the lambda itself
  l.call
  20                            # reached — returns 20
end
```

**Rule of thumb:** use `lambda`/`->` for anything resembling a small function (strict
arity, safe `return`). Use `Proc.new`/bare blocks only when relying on block-specific
behavior (yield, lenient arity) or interop with an API that expects a `Proc`.

## Closures

```ruby
def counter
  count = 0
  increment = -> { count += 1 }
  current   = -> { count }
  [increment, current]
end

inc, get = counter
inc.call
inc.call
get.call   # => 2 — the lambda closes over `count` from its defining scope
```

Blocks/procs/lambdas all close over local variables from their surrounding scope at
definition time — this is the basis for memoization helpers, event callbacks, and building
simple state machines without a class.

## `Symbol#to_proc`

```ruby
names.map(&:upcase)              # shorthand for names.map { |n| n.upcase }
users.select(&:active?)
users.sort_by(&:created_at)

# Composing with method references for more complex chains
method(:puts).to_proc
```

## Docs

- https://docs.ruby-lang.org/en/master/Proc.html
- https://docs.ruby-lang.org/en/master/doc/syntax/calling_methods_rdoc.html
- https://www.ruby-lang.org/en/documentation/quickstart/
