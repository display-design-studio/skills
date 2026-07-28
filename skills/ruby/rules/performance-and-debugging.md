# performance-and-debugging

Why it matters: Ruby's flexibility comes with runtime cost — knowing how to profile, when YJIT actually helps, and how to debug interactively (rather than `puts`-debugging) saves significant time on anything beyond trivial scripts.

## Interactive Debugging

```ruby
require "debug"   # stdlib since Ruby 3.1 — replaces byebug/pry-byebug for most workflows
binding.break      # (alias binding.b) pauses execution here, drops into a debug REPL
```

```bash
ruby -rdebug my_script.rb   # or set RUBY_DEBUG_ENABLE_KEYWORD=1 to trigger via a keyword
```

```ruby
# Pry — richer REPL for exploration (better introspection than irb)
require "pry"
binding.pry
```

Within a `debug`/`pry` session: `next`/`step` to move through code, `continue` to resume,
`up`/`down` to move stack frames, and plain Ruby expressions to inspect local state.

## `irb` Enhancements

```bash
irb                     # stdlib REPL, autocomplete + multiline editing since Ruby 3.x
irb --sample            # (varies by version) explore recent irb features
```

```ruby
# Inside irb
show_source SomeClass#method_name   # print a method's source (irb 1.7+)
ls SomeObject                       # list an object's methods/constants
```

## Warnings and Static Checks

```bash
ruby -w script.rb          # enable verbose warnings (uninitialized ivars, shadowed vars)
ruby -c script.rb           # syntax-only check, no execution
```

```ruby
# Silence a specific known-safe warning locally rather than globally disabling -w
Warning.ignore(/instance variable @foo not initialized/)
```

## Garbage Collection Tuning

```bash
# Common production tuning env vars — reduce GC pause frequency for high-allocation apps
RUBY_GC_HEAP_INIT_SLOTS=600000
RUBY_GC_HEAP_GROWTH_FACTOR=1.8
RUBY_GC_MALLOC_LIMIT=64000000
```

```ruby
GC.stat                 # inspect current heap/GC statistics
GC.stat[:major_gc_count]
GC.start                 # force a full GC — use only for diagnostics, not general code
GC.disable                # disable GC — only for short, allocation-heavy batch scripts
```

Measure before tuning: `GC.stat` before/after a workload, or `RUBY_GC_STATS=1`-style
profiling, tells you whether GC pauses are actually your bottleneck before touching env vars.

## YJIT (Ruby 3.1+, default-on since Ruby 3.3)

```bash
ruby --yjit script.rb
RUBY_YJIT_ENABLE=1 ruby script.rb

ruby --yjit-stats script.rb   # print JIT compilation statistics
```

- YJIT gives the biggest wins on long-running processes with hot, repeatedly-executed
  method bodies (web servers, background workers) — negligible benefit for short-lived
  one-off scripts (the JIT warm-up cost dominates).
- It's enabled by default in Ruby 3.3+ builds compiled with YJIT support — verify with
  `RubyVM::YJIT.enabled?`.

## Profiling

```ruby
# Gemfile: gem "stackprof", group: :development
require "stackprof"

StackProf.run(mode: :cpu, out: "tmp/stackprof-report.dump") do
  expensive_method
end
```

```bash
stackprof tmp/stackprof-report.dump --text     # top methods by self/total time
stackprof tmp/stackprof-report.dump --flamegraph > flamegraph.html
```

```ruby
# Memory profiling
# Gemfile: gem "memory_profiler", group: :development
require "memory_profiler"
report = MemoryProfiler.report { expensive_method }
report.pretty_print
```

- Use `stackprof` (sampling profiler, low overhead) for CPU hotspots in production-like
  workloads; use `memory_profiler` to find unexpected allocation/retention.
- Benchmark micro-optimizations with `Benchmark.bm`/the `benchmark-ips` gem rather than
  guessing — Ruby's optimizer behavior for small snippets is often non-obvious.

```ruby
require "benchmark"
Benchmark.bm do |x|
  x.report("map") { arr.map { |n| n * 2 } }
  x.report("each_with_object") { arr.each_with_object([]) { |n, acc| acc << n * 2 } }
end
```

## Docs

- https://docs.ruby-lang.org/en/master/debug/README_md.html
- https://github.com/ruby/debug
- https://docs.ruby-lang.org/en/master/RubyVM/YJIT.html
- https://github.com/tmm1/stackprof
