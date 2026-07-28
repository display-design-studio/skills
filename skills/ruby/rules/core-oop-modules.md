# core-oop-modules

Why it matters: Ruby's object model (single inheritance + modules for everything else) is different from most mainstream languages — using `include`/`extend`/`prepend` correctly is how Ruby achieves composition without multiple inheritance, and misunderstanding the method resolution order (MRO) causes hard-to-debug override bugs.

## Classes

```ruby
class Animal
  attr_reader :name

  def initialize(name)
    @name = name
  end

  def speak
    raise NotImplementedError, "#{self.class} must implement #speak"
  end
end

class Dog < Animal
  def speak
    "#{name} says Woof!"
  end
end
```

- Use `attr_reader`/`attr_writer`/`attr_accessor` instead of hand-written getters/setters.
- Raise `NotImplementedError` for methods a subclass must override — documents the contract.

## Modules as Namespaces vs Mixins

```ruby
# Namespace — groups related classes, avoids top-level name collisions
module Payments
  class Charge; end
  class Refund; end
end
Payments::Charge.new

# Mixin — shares behavior across unrelated classes
module Trackable
  def track_event(name)
    Analytics.record(self.class.name, name)
  end
end

class Order
  include Trackable   # adds Trackable as an INSTANCE method mixin
end
```

## `include` vs `extend` vs `prepend`

```ruby
module Greetable
  def greet
    "Hello, #{name}"
  end
end

class Person
  include Greetable    # Greetable methods become INSTANCE methods
end
Person.new.greet

class Robot
  extend Greetable      # Greetable methods become CLASS methods
end
Robot.greet

module Loud
  def greet
    super.upcase          # `prepend` inserts Loud BEFORE Person in the ancestor chain
  end
end

class Person
  prepend Loud
end
Person.new.greet   # => "HELLO, ADA" — Loud#greet runs first, then calls super
```

```ruby
Person.ancestors
# => [Loud, Person, Greetable, Object, Kernel, BasicObject]
```

- `include` inserts the module just above the class in the ancestor chain (class wins on
  override).
- `prepend` inserts it just below the class (module wins on override, can wrap/call `super`
  into the original method) — the standard pattern for decorating an existing method
  without monkey-patching it directly.

## Comparable and Enumerable Mixins

```ruby
class Money
  include Comparable
  attr_reader :cents

  def initialize(cents) = @cents = cents
  def <=>(other) = cents <=> other.cents   # implement <=> once, get < <= == > >= between? for free
end

class Collection
  include Enumerable
  def initialize(items) = @items = items
  def each
    return enum_for(:each) unless block_given?
    @items.each { |i| yield i }
  end
end
# Implementing `each` gives you map, select, sort_by, sum, ... for free via Enumerable
```

## Method Missing (last resort)

```ruby
class DynamicConfig
  def initialize(hash) = @hash = hash

  def method_missing(name, *args, &block)
    @hash.key?(name) ? @hash[name] : super
  end

  def respond_to_missing?(name, include_private = false)
    @hash.key?(name) || super
  end
end
```

- Always pair `method_missing` with a matching `respond_to_missing?` — otherwise
  `respond_to?`, `method`, and duck-typing checks silently lie about the object's interface.
- Prefer `define_method` generated at class-definition time (see `metaprogramming.md`) over
  `method_missing` whenever the set of dynamic methods is known ahead of time — it's faster
  and shows up in `instance_methods`.

## Object Equality

```ruby
class Point
  attr_reader :x, :y
  def initialize(x, y) = (@x, @y = x, y)

  def ==(other)
    other.is_a?(Point) && x == other.x && y == other.y
  end
  alias eql? ==

  def hash
    [x, y].hash    # required alongside eql? to use Point as a Hash key or in a Set
  end
end
```

## Docs

- https://docs.ruby-lang.org/en/master/doc/syntax/modules_and_classes_rdoc.html
- https://docs.ruby-lang.org/en/master/Module.html
- https://www.poodr.com/ (Practical Object-Oriented Design in Ruby)
