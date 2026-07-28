# testing-rspec-minitest

Why it matters: Ruby ships Minitest in the standard library, but RSpec dominates real-world usage for its readable DSL — choosing the right one (and using doubles/mocks correctly) keeps tests fast, isolated, and trustworthy. This file covers plain-Ruby testing; for Rails-specific test types (fixtures, system tests, request specs), see the `ruby-on-rails` skill's `testing-patterns.md`.

## Minitest (stdlib, no extra gem required)

```ruby
require "minitest/autorun"

class CalculatorTest < Minitest::Test
  def setup
    @calc = Calculator.new
  end

  def test_addition
    assert_equal 4, @calc.add(2, 2)
  end

  def test_division_by_zero_raises
    assert_raises(ZeroDivisionError) { @calc.divide(1, 0) }
  end
end
```

```ruby
# Minitest::Spec — RSpec-like DSL built into Minitest, no extra dependency
describe Calculator do
  before { @calc = Calculator.new }

  it "adds two numbers" do
    _(@calc.add(2, 2)).must_equal 4
  end
end
```

```bash
ruby -Itest test/calculator_test.rb
rake test              # typical Rakefile task wired to Rake::TestTask
```

## RSpec

```ruby
# Gemfile: group :test do gem "rspec" end
# bundle exec rspec --init   generates spec/spec_helper.rb + .rspec

RSpec.describe Calculator do
  subject(:calculator) { described_class.new }

  describe "#add" do
    it "returns the sum of two numbers" do
      expect(calculator.add(2, 2)).to eq(4)
    end
  end

  describe "#divide" do
    it "raises when dividing by zero" do
      expect { calculator.divide(1, 0) }.to raise_error(ZeroDivisionError)
    end
  end

  context "with a negative number" do
    it "still adds correctly" do
      expect(calculator.add(-2, 5)).to eq(3)
    end
  end
end
```

```bash
bundle exec rspec                      # run full suite
bundle exec rspec spec/calculator_spec.rb:12   # run one example by line
bundle exec rspec --fail-fast           # stop at first failure
```

- Use `subject`/`described_class` to avoid repeating the class name across a spec file.
- Group related expectations under `describe`/`context` — `context` for a scenario/state,
  `describe` for a method or feature.

## Doubles, Stubs, and Mocks (RSpec)

```ruby
# Verified double — checks the stubbed methods actually exist on the real class
payment_gateway = instance_double(PaymentGateway, charge: true)

# Stub a specific return value
allow(user).to receive(:admin?).and_return(true)

# Expect a method to be called (fails the test if it isn't)
expect(mailer).to receive(:deliver_later)
OrderMailer.confirmation(order).deliver_later
```

- Prefer `instance_double`/`class_double` over plain `double`/`allow(Object.new)` — verified
  doubles fail the test if the real class's interface changes, catching stale mocks.
- Don't stub the method you're actually testing — stub its collaborators, not the subject.

## Shared Examples and Test Helpers

```ruby
RSpec.shared_examples "a trackable model" do
  it "responds to track_event" do
    expect(subject).to respond_to(:track_event)
  end
end

RSpec.describe Order do
  it_behaves_like "a trackable model"
end
```

## General Principles

- One behavior per test/example — a failure name should tell you exactly what broke.
- Prefer testing observable behavior (return values, side effects, raised errors) over
  internal implementation details (private methods, instance variables).
- Keep test data construction (factories/fixtures/builders) out of the test body when it's
  reused — extract a builder method or use FactoryBot (Rails ecosystem) so specs read as
  intent, not setup.

## Docs

- https://rspec.info/documentation/
- https://docs.ruby-lang.org/en/master/minitest/
- https://github.com/minitest/minitest
