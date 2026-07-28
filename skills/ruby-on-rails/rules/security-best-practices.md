# security-best-practices

Why it matters: Rails includes many built-in security features, but they only work if used correctly. A single missing CSRF token, unescaped output, or unpermitted param can compromise the entire app.

## CSRF Protection

Rails enables CSRF protection by default. **Never disable it.**

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception  # raises InvalidAuthenticityToken
  # For API controllers that use token auth instead:
  # protect_from_forgery with: :null_session
end
```

Always include in layouts:
```erb
<%= csrf_meta_tags %>   <%# required for JS requests (fetch, Turbo) %>
```

## XSS Prevention

```erb
<%# Rails auto-escapes — this is safe %>
<%= user.name %>
<%= user.bio %>

<%# NEVER do this with user content %>
<%= raw user.bio %>
<%= user.bio.html_safe %>

<%# If you must render HTML (e.g. rich text from ActionText), use sanitize %>
<%= sanitize user.bio, tags: %w[p b i em strong a ul ol li], attributes: %w[href] %>
```

## SQL Injection

```ruby
# Incorrect — interpolation is NEVER safe
User.where("email = '#{params[:email]}'")

# Correct — parameterized queries
User.where(email: params[:email])
User.where("email = ?", params[:email])
User.where("email = :email", email: params[:email])

# Named scopes are safe
User.by_email(params[:email])
```

## Strong Parameters

```ruby
# Incorrect — permit everything
params[:user]                         # hash, no filtering
params.require(:user).permit!         # permits ALL — dangerous

# Correct — explicit whitelist
def user_params
  params.require(:user).permit(:name, :email, :bio)
  # Never include: :admin, :role, :is_superuser without authorization check
end
```

## Mass Assignment with Role-Based Fields

```ruby
def user_params
  permitted = [:name, :email]
  permitted << :role if current_user.admin?  # only admins can set role
  params.require(:user).permit(*permitted)
end
```

## Secrets Management

```bash
# Never hardcode secrets in source code
# Use Rails encrypted credentials
rails credentials:edit

# Access in code
Rails.application.credentials.stripe[:secret_key]
Rails.application.credentials.dig(:aws, :access_key_id)

# Or use ENV variables (12-factor style)
ENV["STRIPE_SECRET_KEY"]
```

```ruby
# config/credentials.yml.enc (encrypted, safe to commit)
stripe:
  publishable_key: pk_live_xxx
  secret_key: sk_live_xxx

aws:
  access_key_id: AKIA...
  secret_access_key: xxx
```

## Authentication

### Rails 8 built-in authentication generator (preferred starting point)

Rails 8.0+ ships a first-party generator that scaffolds a minimal, cookie-session-based
auth system directly into the app (no extra gem, fully editable code):

```bash
rails generate authentication
rails db:migrate
```

This generates:
- `User` model with `has_secure_password` (bcrypt) and a normalized/downcased `email_address`
- `Session` model + `sessions` table (one row per signed-in device/browser)
- `SessionsController` (`new`/`create`/`destroy` for sign in/out)
- `PasswordsController` for password-reset flows (token via `generates_token_for`)
- `Current` (`ActiveSupport::CurrentAttributes`) holding `Current.session` / `Current.user` per request
- `Authentication` concern included in `ApplicationController`, providing `authenticate_user!`,
  `require_authentication` as a `before_action`, and `resume_session`

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  include Authentication
  # require_authentication runs as a before_action by default — opt out per controller with:
  # allow_unauthenticated_access only: %i[index show]
end
```

Because the generated code lives in `app/`, treat it like any other app code: add rate
limiting on sign-in (`rate_limit` on the controller action), lock accounts after repeated
failures, and extend `Session` with metadata (IP, user agent) as needed.

### Third-party gems (when you need more out of the box)

```ruby
# Gemfile
gem "devise"          # full-featured, most common, admin/omniauth/confirmable modules
gem "rodauth-rails"   # modern alternative, high customizability
```

Use a gem instead of the built-in generator when you need multi-role admin panels,
OmniAuth/SSO providers, or account confirmation/lockable modules out of the box.

### Manual `has_secure_password` (for a single-table, no-sessions-model setup)

```ruby
class User < ApplicationRecord
  has_secure_password  # uses bcrypt, adds authenticate method

  validates :email, presence: true, uniqueness: true
  validates :password, length: { minimum: 12 }, if: :password_digest_changed?
end
```

## Authorization

```ruby
# Use a policy object (Pundit pattern) rather than inline checks
class PostPolicy
  def initialize(user, post)
    @user = user
    @post = post
  end

  def update?
    @user.admin? || @post.author == @user
  end
end

# In controller
def update
  @post = Post.find(params[:id])
  policy = PostPolicy.new(current_user, @post)
  redirect_to root_path, alert: "Not authorized." unless policy.update?
  # ...
end
```

## HTTP Security Headers

```ruby
# config/application.rb or an initializer
config.force_ssl = true  # in production — redirects HTTP to HTTPS

# Rails sets these by default via ActionDispatch::SSL and SecureHeaders:
# - Strict-Transport-Security (HSTS)
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: SAMEORIGIN
# - X-XSS-Protection: 1; mode=block
# Add CSP:
config.content_security_policy do |policy|
  policy.default_src :self
  policy.script_src  :self
  policy.style_src   :self, :unsafe_inline  # adjust per app
end
```

## Docs

- https://guides.rubyonrails.org/security.html
- https://guides.rubyonrails.org/action_controller_overview.html#strong-parameters
