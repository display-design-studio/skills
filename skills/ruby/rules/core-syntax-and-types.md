# core-syntax-and-types

Why it matters: Ruby's core types and control-flow idioms (symbols vs strings, truthiness, pattern matching) are used everywhere — getting them wrong causes subtle bugs (mutable string keys, `nil` vs `false` confusion) and unidiomatic code that's harder for other Rubyists to review.

## Symbols vs Strings

```ruby
# Symbols — immutable, interned (same object every time), ideal for identifiers
:name == :name        # => true, same object_id
"name".object_id == "name".object_id  # => false, new String each time

# Use symbols for: hash keys, enum-like values, method names
user = { name: "Ada", role: :admin }

# Use strings for: actual text content, anything mutated or built dynamically
greeting = "Hello, #{user[:name]}!"
```

- Prefer symbol keys (`name:`) over string keys in hashes you control — faster lookup, less memory.
- Never dynamically create symbols from unbounded user input (`params[:x].to_sym`) — symbols are never garbage collected pre-3.0-interning changes for some Ruby builds; more importantly it's a footgun for memory growth and injection into method dispatch.

## Truthiness

```ruby
# Only nil and false are falsy — everything else (0, "", [], {}) is truthy
if 0
  puts "reached"  # runs! unlike many other languages
end

# Safe navigation avoids NoMethodError on nil chains
user&.profile&.avatar_url   # returns nil instead of raising if any link is nil

# nil-coalescing pattern
name = user.name || "Anonymous"
count = params[:count]&.to_i || 0
```

## String Formatting

```ruby
# Prefer interpolation over concatenation
"Hello, #{name}!"          # correct
"Hello, " + name + "!"     # avoid — allocates intermediate strings

# Frozen string literals — enable per-file to reduce allocations
# frozen_string_literal: true
CONST = "value".freeze     # explicit freeze still needed without the magic comment

# Heredocs for multi-line strings
sql = <<~SQL
  SELECT * FROM users
  WHERE active = true
SQL
```

## Numeric Types

```ruby
10 / 3        # => 3 (Integer division truncates)
10 / 3.0      # => 3.3333333333333335
10.fdiv(3)    # => 3.3333333333333335 (explicit float division)
10 % 3        # => 1

1_000_000     # underscores as digit separators, readability only
(1..10).sum   # => 55
```

## Control Flow

```ruby
# Modifier forms — idiomatic for single-line guards
return unless user.active?
raise ArgumentError, "missing email" if email.blank?

# unless/else is confusing — avoid; use if with negation instead
# case/when for multi-branch dispatch
case status
when :draft    then "Not yet published"
when :published then "Live"
else "Unknown"
end
```

## Pattern Matching (`case/in`, Ruby 2.7+)

```ruby
config = { name: "Ada", roles: [:admin, :editor] }

case config
in { name: String => name, roles: [:admin, *] }
  puts "#{name} is an admin"
in { name:, roles: }
  puts "#{name} has roles #{roles}"
end

# Deconstruction in method args / assignment
case [1, [2, 3]]
in [Integer => a, [Integer, Integer] => rest]
  puts "a=#{a}, rest=#{rest}"
end

# Find pattern (Ruby 3.0+) — search anywhere in an array
case [1, 2, 3, 4, 5]
in [*, 3, *post]
  puts "found 3, rest after: #{post}"
end
```

Use `case/in` over long `if/elsif` chains when destructuring nested hashes/arrays (e.g. parsing JSON API responses) — it's both a match and an extraction in one step.

## Ranges

```ruby
(1..5).to_a      # => [1, 2, 3, 4, 5] inclusive
(1...5).to_a     # => [1, 2, 3, 4] exclusive of end
("a".."e").to_a  # => ["a", "b", "c", "d", "e"]

# Endless / beginless ranges (Ruby 2.6+ / 2.7+)
array[2..]       # from index 2 to end
array[..2]       # from start to index 2
(1..).each { |n| break if n > 1000; ... }  # infinite range, must break
```

## Docs

- https://docs.ruby-lang.org/en/
- https://www.ruby-lang.org/en/documentation/quickstart/
- https://rubyreferences.github.io/rubychanges/ (per-version syntax additions)
