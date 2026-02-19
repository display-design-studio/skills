# debug-tools

Why it matters: knowing the right debugging tool for each situation saves hours — Rails ships with a powerful set of debugging utilities, but they need to be applied at the right layer.

## IRB Debugger (Rails 8 default)

```ruby
# Drop a breakpoint anywhere in Ruby code
def create
  @post = Post.new(post_params)
  debugger  # Rails 8 uses IRB-based debugger (replaces byebug)
  @post.save
end
```

In the terminal running `rails server`, you get an interactive prompt:

```
(rdbg) @post        # inspect variable
(rdbg) post_params  # call method
(rdbg) next         # step over
(rdbg) step         # step into
(rdbg) continue     # resume
(rdbg) backtrace    # show call stack
```

Install `debug` gem for enhanced features:

```ruby
gem "debug", group: :development
```

## Web Console (browser-based REPL)

Automatically available on Rails error pages. Use explicitly in views/controllers:

```erb
<%# app/views/posts/show.html.erb %>
<%= console %>   <%# opens a REPL in the browser at this point in rendering %>
```

```ruby
# In a controller action (only in development)
console  # opens in browser
```

## Rails Logger

```ruby
# Use Rails.logger, not puts — logger respects log levels and goes to log files
Rails.logger.debug  "Debug info: #{variable.inspect}"
Rails.logger.info   "User #{user.id} logged in"
Rails.logger.warn   "Deprecated method called"
Rails.logger.error  "Payment failed: #{error.message}"

# Tag log lines for multi-request tracing
config.log_tags = [:request_id, :remote_ip]
```

Log levels by environment:

```ruby
# config/environments/production.rb
config.log_level = :info   # :debug in development, :warn in high-traffic production
```

## Inspecting Queries

```ruby
# In console — see the SQL generated
Post.published.recent.to_sql
# => "SELECT \"posts\".* FROM \"posts\" WHERE..."

Post.published.recent.explain
# => QUERY PLAN / index usage

# Enable query logging in development
# Already on by default — appears in terminal and log/development.log
```

## Common Errors and Solutions

**`ActiveRecord::RecordNotFound`**
```ruby
# Wrong — raises on missing record
Post.find(params[:id])

# Right — returns nil, handle gracefully
@post = Post.find_by(id: params[:id])
return redirect_to posts_path, alert: "Post not found." unless @post
# Or just use find and let the 404 bubble up — Rails handles it
```

**`ActionController::InvalidAuthenticityToken`**
- CSRF token missing in form → ensure `<%= csrf_meta_tags %>` in layout and `<%= form_with %>` (not raw `<form>`).

**`ActiveModel::ForbiddenAttributesError`**
- Forgetting strong parameters → add `permit` to `_params` method.

**`ActionView::MissingTemplate`**
- Template file doesn't match action name or format → check `app/views/controller_name/action_name.html.erb`.

**`N+1 queries in logs`**
```
# Log shows repeated queries like:
SELECT * FROM comments WHERE post_id = 1
SELECT * FROM comments WHERE post_id = 2
...
# Fix: Post.includes(:comments)
```

## Rails Console Tips

```bash
rails console                 # standard REPL (production: rails console -e production)
rails console --sandbox       # all DB changes rolled back on exit
```

```ruby
# Reload code without restarting console
reload!

# Inspect routes
app.post_path(Post.first)

# Test a mailer without sending
UserMailer.welcome(User.first).body.encoded

# Simulate a request in console
app.get "/posts"
app.response.status
```

## Docs

- https://guides.rubyonrails.org/debugging_rails_applications.html
- https://guides.rubyonrails.org/error_reporting.html
