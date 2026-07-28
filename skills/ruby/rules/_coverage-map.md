# Ruby Coverage Map

Canonical sources: https://www.ruby-lang.org/en/documentation/ (Ruby 4.0, with 3.3/master references), https://docs.ruby-lang.org/en, https://rubystyle.guide/

This map links documentation resources to this skill's rule files.

## Core Language

- Ruby Reference Manual: https://docs.ruby-lang.org/en -> `core-syntax-and-types.md`, `core-collections-enumerable.md`
- Ruby in Twenty Minutes: https://www.ruby-lang.org/en/documentation/quickstart/ -> `core-syntax-and-types.md`
- Enumerable / Array / Hash / Data API docs: https://docs.ruby-lang.org/en/master/ -> `core-collections-enumerable.md`
- Syntax — calling methods / blocks: https://docs.ruby-lang.org/en/master/doc/syntax/calling_methods_rdoc.html -> `core-blocks-procs-lambdas.md`
- Modules and Classes: https://docs.ruby-lang.org/en/master/doc/syntax/modules_and_classes_rdoc.html -> `core-oop-modules.md`
- Practical Object-Oriented Design in Ruby (POODR): https://www.poodr.com/ -> `core-oop-modules.md`

## Metaprogramming

- Module/refinements docs: https://docs.ruby-lang.org/en/master/doc/syntax/refinements_rdoc.html -> `metaprogramming.md`
- Metaprogramming Ruby 2 (book): https://pragprog.com/titles/ppmetr2/metaprogramming-ruby-2/ -> `metaprogramming.md`

## Dependency Management

- Bundler: https://bundler.io/ -> `gems-and-bundler.md`
- RubyGems guides: https://guides.rubygems.org/ -> `gems-and-bundler.md`

## Testing

- RSpec documentation: https://rspec.info/documentation/ -> `testing-rspec-minitest.md`
- Minitest (stdlib): https://docs.ruby-lang.org/en/master/minitest/ -> `testing-rspec-minitest.md`

## Style & Typing

- Ruby Style Guide (RuboCop basis): https://rubystyle.guide/ -> `style-and-typing.md`
- RuboCop docs: https://docs.rubocop.org/rubocop/ -> `style-and-typing.md`
- RBS: https://github.com/ruby/rbs -> `style-and-typing.md`
- Steep: https://github.com/soutaro/steep -> `style-and-typing.md`
- ruby-lsp: https://github.com/Shopify/ruby-lsp -> `style-and-typing.md`

## Performance & Debugging

- debug gem (stdlib): https://github.com/ruby/debug -> `performance-and-debugging.md`
- YJIT: https://docs.ruby-lang.org/en/master/RubyVM/YJIT.html -> `performance-and-debugging.md`
- stackprof: https://github.com/tmm1/stackprof -> `performance-and-debugging.md`

## Notes

- Ruby releases a new major/minor around December each year; check
  https://www.ruby-lang.org/en/downloads/releases/ for version-specific changes.
- For Rails framework specifics (Active Record, controllers, views, jobs, deployment),
  see the sibling `ruby-on-rails` skill instead of duplicating content here.
- API reference: https://docs.ruby-lang.org/en/ (versioned per release, e.g. `/en/4.0`)
