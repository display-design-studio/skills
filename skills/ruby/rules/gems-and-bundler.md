# gems-and-bundler

Why it matters: nearly every non-trivial Ruby project depends on Bundler for reproducible dependency resolution — getting the Gemfile/lockfile workflow wrong causes "works on my machine" bugs and broken CI.

## Gemfile Basics

```ruby
# Gemfile
source "https://rubygems.org"

ruby "3.3.5"                     # pin the Ruby version for the whole team/CI

gem "rails", "~> 8.1.0"          # pessimistic version constraint (>= 8.1.0, < 8.2.0)
gem "pg"
gem "puma", ">= 6.0"

group :development, :test do
  gem "rspec"
  gem "rubocop", require: false  # CLI tool only, don't autoload it into the app
end

group :test do
  gem "webmock"
end
```

```bash
bundle init          # generate a starter Gemfile
bundle install        # resolve + install, writes/updates Gemfile.lock
bundle install --without production   # skip a group locally
bundle update rspec    # bump just one gem (and its dependents) within constraints
bundle outdated        # list gems with newer versions available
bundle exec rspec       # run a command using the bundle's exact resolved versions
```

- **Always commit `Gemfile.lock`** for applications (not for gems you publish) — it pins
  the exact resolved dependency graph so CI and every developer run identical versions.
- Use `~>` (pessimistic operator) for version constraints in apps; avoid unpinned `gem "x"`
  for anything security-sensitive.
- `require: false` for CLI-only gems (rubocop, annotate) prevents them from being
  autoloaded and slowing app boot.

## Bundler Groups and Environments

```ruby
gem "sqlite3", group: :development
gem "pg", group: :production

# Conditional gems
gem "tzinfo-data", platforms: %i[mswin mingw x64_mingw jruby]
```

```bash
# BUNDLE_WITHOUT / --without persists in .bundle/config
bundle config set --local without 'development test'
```

## Creating a Gem

```bash
bundle gem my_gem --test=rspec --ci=github  # scaffolds structure, gemspec, CI config
```

```ruby
# my_gem.gemspec
Gem::Specification.new do |spec|
  spec.name        = "my_gem"
  spec.version     = MyGem::VERSION
  spec.summary     = "Short description"
  spec.authors     = ["Your Name"]
  spec.files       = Dir["lib/**/*.rb"]
  spec.require_paths = ["lib"]

  spec.add_dependency "activesupport", ">= 7.0"
  spec.add_development_dependency "rspec", "~> 3.0"

  spec.required_ruby_version = ">= 3.2"
end
```

```bash
gem build my_gem.gemspec
gem push my_gem-0.1.0.gem     # publish to rubygems.org (requires an API key)
```

- Structure library code under `lib/my_gem/`, with `lib/my_gem.rb` as the single entry
  point that requires the rest — matches what `Bundler.require` and autoloaders expect.
- Follow semantic versioning (`MAJOR.MINOR.PATCH`) in `lib/my_gem/version.rb`.

## Vendoring / Local Path Gems (useful during development)

```ruby
gem "my_engine", path: "../my_engine"     # local filesystem, for developing a gem alongside its consumer
gem "my_lib", git: "https://github.com/org/my_lib", branch: "main"
gem "my_lib", github: "org/my_lib", tag: "v1.2.0"
```

Never leave a `path:`/`git:` override pointing at a local branch in a Gemfile that gets
merged to `main` — it breaks CI and other developers' installs.

## Docs

- https://bundler.io/
- https://guides.rubygems.org/
- https://guides.rubygems.org/make-your-own-gem/
