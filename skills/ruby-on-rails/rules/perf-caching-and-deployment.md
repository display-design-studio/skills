# perf-caching-and-deployment

Why it matters: correct caching dramatically reduces response times and DB load; proper Puma/concurrency configuration prevents crashes and slowness under production traffic.

---

## Caching

### Enable caching in development

```bash
rails dev:cache  # toggles caching on/off in development
```

### Fragment caching (view-level)

```erb
<%# Cache the rendered fragment — auto-expires when @post changes (cache key includes updated_at) %>
<% cache @post do %>
  <%= render @post %>
<% end %>

<%# Cache a collection %>
<% cache ["v1", @posts] do %>
  <%= render @posts %>
<% end %>
```

### Russian doll caching (nested fragments)

```erb
<% cache @post do %>
  <h1><%= @post.title %></h1>
  <% cache @post.comments do %>
    <%= render @post.comments %>
  <% end %>
<% end %>
```

Each level expires independently. When a comment changes, only the inner fragment is invalidated.

### Low-level (store) caching

```ruby
# Cache expensive computation for 1 hour
@popular_tags = Rails.cache.fetch("popular_tags", expires_in: 1.hour) do
  Tag.most_popular.limit(20).to_a
end

# Cache per-record
def expensive_stat
  Rails.cache.fetch("user/#{id}/stat", expires_in: 30.minutes) do
    compute_expensive_stat
  end
end
```

### HTTP caching

```ruby
class PostsController < ApplicationController
  def show
    @post = Post.find(params[:id])
    # Return 304 Not Modified if unchanged — saves bandwidth + DB reads
    fresh_when @post
  end

  def index
    @posts = Post.published.recent
    expires_in 5.minutes, public: true  # CDN-cacheable
  end
end
```

### Cache store configuration

```ruby
# config/environments/production.rb

# Redis (recommended for multi-process/multi-server setups)
config.cache_store = :redis_cache_store, {
  url: ENV["REDIS_URL"],
  expires_in: 1.day
}

# Solid Cache (Rails 8 default — DB-backed, no Redis needed)
config.cache_store = :solid_cache_store
```

---

## Performance — Database

```ruby
# Counter cache — avoid COUNT(*) queries
class Post < ApplicationRecord
  belongs_to :user, counter_cache: true  # adds comments_count column on users
  has_many :comments
end

# Bullet gem detects N+1 in development
# Gemfile
gem "bullet", group: :development
```

```ruby
# config/environments/development.rb
config.after_initialize do
  Bullet.enable        = true
  Bullet.alert         = true
  Bullet.rails_logger  = true
end
```

---

## Puma Configuration (Production)

```ruby
# config/puma.rb

# Threads: min/max per worker
threads_count = Integer(ENV.fetch("RAILS_MAX_THREADS", 3))
threads threads_count, threads_count

# Workers (processes) — typically 2-4 per CPU core
workers_count = Integer(ENV.fetch("WEB_CONCURRENCY", 2))
workers workers_count

# Preload app for COW memory savings with workers
preload_app!

# Reconnect DB after fork
on_worker_boot do
  ActiveRecord::Base.establish_connection
end

port ENV.fetch("PORT", 3000)
environment ENV.fetch("RAILS_ENV", "development")
```

**Rules:**
- `WEB_CONCURRENCY` (workers) scales horizontally — each worker is a separate process.
- `RAILS_MAX_THREADS` scales within a process — watch for DB connection pool limits.
- DB pool size should equal `WEB_CONCURRENCY × RAILS_MAX_THREADS`.

```yaml
# config/database.yml — pool must match threads × workers
production:
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
```

---

## Asset Pipeline (Propshaft / Sprockets)

```bash
# Precompile assets for production
RAILS_ENV=production rails assets:precompile

# With Vite (jsbundling-rails)
RAILS_ENV=production rails javascript:build
```

---

## Deployment with Kamal (Rails 8 default)

`rails new` sets up Kamal by default — it deploys your app as Docker containers to any
server(s) you control via SSH, no PaaS required.

```bash
bin/kamal setup     # first-time provision: install Docker, push image, start app + accessories
bin/kamal deploy    # build image, push to registry, roll out with zero-downtime health checks
bin/kamal rollback  # revert to the previous image
bin/kamal app logs -f
bin/kamal console   # rails console on a remote server
```

```yaml
# config/deploy.yml
service: myapp
image: myuser/myapp

servers:
  web:
    - 192.168.0.1

registry:
  username: myuser
  password:
    - KAMAL_REGISTRY_PASSWORD   # read from .kamal/secrets

env:
  secret:
    - RAILS_MASTER_KEY

accessories:
  db:
    image: postgres:17
    host: 192.168.0.1
    port: "5432:5432"
    env:
      clear:
        POSTGRES_USER: myapp
      secret:
        - POSTGRES_PASSWORD
    volumes:
      - data:/var/lib/postgresql/data
```

- Secrets referenced in `deploy.yml` are pulled from `.kamal/secrets` (which itself can read
  from a password manager or `ENV`) — never commit real secret values.
- Kamal proxies traffic through `kamal-proxy`, giving zero-downtime deploys and automatic
  Let's Encrypt TLS when a `proxy.host` domain is configured.

## Thruster (HTTP proxy in front of Puma)

Rails 8 apps generated with Docker support include Thruster by default — a small Rust
proxy that sits in front of Puma inside the same container:

```dockerfile
# Dockerfile (generated)
ENTRYPOINT ["/rails/bin/docker-entrypoint"]
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
```

Thruster provides, with zero configuration: X-Sendfile-based asset/static file caching,
HTTP/2 support, and automatic gzip compression — so Puma itself doesn't need a reverse
proxy like Nginx for these concerns in simple single-server deployments.

## Deployment checklist

```bash
RAILS_ENV=production rails db:migrate          # run migrations
RAILS_ENV=production rails assets:precompile   # compile assets
RAILS_ENV=production rails cache:clear         # clear stale cache
```

## Docs

- https://guides.rubyonrails.org/caching_with_rails.html
- https://guides.rubyonrails.org/tuning_performance_for_deployment.html
- https://guides.rubyonrails.org/configuring.html
- https://kamal-deploy.org/
- https://github.com/basecamp/thruster
