# core-collections-enumerable

Why it matters: almost all real Ruby code is data transformation over Array/Hash via Enumerable — knowing the right method (vs. hand-rolled loops) makes code shorter, faster, and far more readable.

## Array

```ruby
nums = [3, 1, 4, 1, 5, 9]

nums.sort                 # => [1, 1, 3, 4, 5, 9]
nums.uniq                 # => [3, 1, 4, 5, 9]
nums.sum                  # => 23
nums.min, nums.max        # => 1, 9
nums.first(2), nums.last(2)
nums.each_slice(2).to_a    # => [[3, 1], [4, 1], [5, 9]]
nums.each_cons(2).to_a     # => [[3, 1], [1, 4], [4, 1], [1, 5], [5, 9]]
nums.partition { |n| n.even? }  # => [[4], [3, 1, 1, 5, 9]]
nums.tally                # => {3=>1, 1=>2, 4=>1, 5=>1, 9=>1}
nums.group_by { |n| n.even? ? :even : :odd }
```

- `map`/`select`/`reject`/`reduce` return new arrays — never mutate the receiver.
- Their bang counterparts (`map!`, `select!`, `sort!`) mutate in place — use only when you
  explicitly want to reuse the same object (perf-sensitive hot paths).

## Hash

```ruby
user = { name: "Ada", email: "ada@example.com" }

user.fetch(:name)                  # raises KeyError if missing — safer than []
user.fetch(:age, 0)                # default value instead of raising
user.dig(:address, :city)          # nil-safe nested lookup, no NoMethodError
user.transform_values(&:to_s)
user.select { |k, v| k == :name }
user.each_pair { |k, v| puts "#{k}: #{v}" }

# Merge with conflict resolution
defaults = { role: :member, active: true }
defaults.merge(user) { |key, old, new| new }  # right-hand wins by default anyway

# Build a hash from pairs
pairs = [[:a, 1], [:b, 2]]
pairs.to_h                          # => {a: 1, b: 2}
[1, 2, 3].to_h { |n| [n, n * n] }    # => {1=>1, 2=>4, 3=>9}
```

- Prefer `fetch`/`dig` over `[]` when a missing key is a bug you want to surface early.

## Struct & Data (Ruby 3.2+)

```ruby
# Struct — mutable value object with generated accessors
Point = Struct.new(:x, :y) do
  def distance_to(other)
    Math.hypot(x - other.x, y - other.y)
  end
end
Point.new(0, 0).distance_to(Point.new(3, 4))  # => 5.0

# Data — immutable value object (Ruby 3.2+), preferred for simple value types
Coordinate = Data.define(:lat, :lng)
c = Coordinate.new(lat: 45.0, lng: 9.0)
c.with(lat: 46.0)   # => new Coordinate, original unchanged
```

Prefer `Data.define` over `Struct.new` for new immutable value objects (DTOs, coordinates,
money amounts) — it communicates immutability and disallows accidental mutation.

## Enumerable Chaining

```ruby
users.select(&:active?)
     .sort_by(&:created_at)
     .map { |u| u.name.upcase }
     .first(10)

# reduce/inject for aggregation
prices.reduce(0) { |sum, price| sum + price }
prices.sum  # simpler when the operation is just `+`

# each_with_object — build a collection without an external accumulator variable
result = users.each_with_object({}) { |u, h| h[u.id] = u.name }
```

## Lazy Enumerators

```ruby
# Without laziness this reads and squares the WHOLE file before taking 5
(1..Float::INFINITY).lazy
  .map { |n| n * n }
  .select { |n| n.even? }
  .first(5)          # => [4, 16, 36, 64, 100] — only computes what's needed

File.foreach("huge_log.txt").lazy
  .grep(/ERROR/)
  .first(20)          # stops reading the file after 20 matches
```

Use `.lazy` when chaining multiple transformations over a large or infinite/streaming
source and you only need a subset of the result — it avoids building intermediate arrays.

## Docs

- https://docs.ruby-lang.org/en/master/Enumerable.html
- https://docs.ruby-lang.org/en/master/Array.html
- https://docs.ruby-lang.org/en/master/Hash.html
- https://docs.ruby-lang.org/en/master/Data.html
