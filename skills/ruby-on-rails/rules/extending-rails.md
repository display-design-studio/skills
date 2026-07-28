# extending-rails

Why it matters: growing apps eventually need shared, mountable functionality (engines),
project-specific code generators, or custom Rack middleware. Doing these the Rails way
keeps them upgradable and testable instead of becoming ad-hoc monkey patches.

## Rails Engines

An engine is a miniature Rails app that plugs into a host app — used to share a full
feature (models, views, controllers, routes) across projects, or to isolate a bounded
context inside a large monolith.

```bash
# Mountable engine — isolated namespace, own routes, own asset/view lookup path
rails plugin new blorgh --mountable

# Full engine — shares the host app's namespace (like a regular Rails app module)
rails plugin new blorgh --full
```

```ruby
# blorgh/lib/blorgh/engine.rb
module Blorgh
  class Engine < ::Rails::Engine
    isolate_namespace Blorgh
  end
end
```

```ruby
# host app config/routes.rb
mount Blorgh::Engine => "/blog"
```

```ruby
# host app Gemfile — local engine during development
gem "blorgh", path: "engines/blorgh"
```

- Mountable engines namespace everything (`Blorgh::Post`, `blorgh/posts` table) so they
  never collide with host-app models.
- Ship a `blorgh_manifest.js`/`assets` folder and migrations under `db/migrate` inside the
  engine; hosts run `rails blorgh:install:migrations` then `rails db:migrate`.

## Custom Generators

Add project-specific `rails generate` commands (e.g. to scaffold a service object or a
consistent module pattern across the team).

```bash
rails generate generator service_object
```

```ruby
# lib/generators/service_object/service_object_generator.rb
class ServiceObjectGenerator < Rails::Generators::NamedBase
  source_root File.expand_path("templates", __dir__)

  def create_service_file
    template "service.rb.tt", File.join("app/services", "#{file_name}_service.rb")
  end
end
```

```bash
rails generate service_object charge_customer
# => app/services/charge_customer_service.rb
```

- Generators live under `lib/generators/<name>/` and use Thor under the hood
  (`Rails::Generators::Base`/`NamedBase`).
- Use `hook_for` to chain other generators (e.g. auto-generate a matching test).

## Rack Middleware

Insert custom Rack middleware into the Rails stack for cross-cutting concerns (request
tagging, custom auth headers, maintenance mode) that don't belong in a controller filter.

```ruby
# app/middleware/request_id_logger.rb
class RequestIdLogger
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    Rails.logger.info("Request-Id: #{request.get_header('action_dispatch.request_id')}")
    @app.call(env)
  end
end
```

```ruby
# config/application.rb
config.middleware.use RequestIdLogger

# Insert relative to another middleware
config.middleware.insert_before ActionDispatch::Static, RequestIdLogger

# Swap out a default middleware
config.middleware.swap ActionDispatch::Session::CookieStore, MyCustomSessionStore
```

```bash
rails middleware   # print the full middleware stack in order
```

- Prefer a controller `before_action` for anything that needs Rails' request/response
  objects, params, or session — middleware operates on the raw Rack env and is best for
  concerns that must run for *every* request, including ones outside your controllers.

## Docs

- https://guides.rubyonrails.org/engines.html
- https://guides.rubyonrails.org/generators.html
- https://guides.rubyonrails.org/rails_on_rack.html
