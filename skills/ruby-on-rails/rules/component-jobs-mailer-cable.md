# component-jobs-mailer-cable

Why it matters: background jobs, email delivery, and WebSocket channels are core Rails components that enable async processing, notifications, and real-time features — each with specific patterns to avoid data loss, email leaks, and connection issues.

---

## Active Job (Background Jobs)

### Setup

```ruby
# Gemfile — choose a backend
gem "sidekiq"      # Redis-backed, most common in production
# or
gem "solid_queue"  # DB-backed, built into Rails 8

# config/application.rb
config.active_job.queue_adapter = :sidekiq
# Rails 8 default: :solid_queue
```

### Defining a Job

```ruby
# app/jobs/send_welcome_email_job.rb
class SendWelcomeEmailJob < ApplicationJob
  queue_as :default

  # Retry up to 3 times with exponential backoff
  retry_on StandardError, wait: :polynomially_longer, attempts: 3
  discard_on ActiveJob::DeserializationError  # record deleted before job ran

  def perform(user_id)
    user = User.find_by(id: user_id)
    return unless user  # guard: record may have been deleted

    UserMailer.welcome(user).deliver_now
  end
end
```

### Enqueuing

```ruby
# Enqueue immediately
SendWelcomeEmailJob.perform_later(user.id)  # pass IDs, not AR objects

# Enqueue with delay
SendWelcomeEmailJob.set(wait: 5.minutes).perform_later(user.id)
SendWelcomeEmailJob.set(wait_until: Date.tomorrow.noon).perform_later(user.id)
```

**Rule:** Pass `id` (not the AR object) to jobs. Objects are serialized to GlobalIDs and may be stale when the job runs.

---

## Action Mailer

### Mailer class

```ruby
# app/mailers/user_mailer.rb
class UserMailer < ApplicationMailer
  default from: "noreply@example.com"

  def welcome(user)
    @user = user
    @login_url = login_url  # URL helpers available in mailers
    mail(to: @user.email, subject: "Welcome to MyApp!")
  end

  def password_reset(user, token)
    @user = user
    @token = token
    mail(to: @user.email, subject: "Reset your password")
  end
end
```

### Templates

```erb
<%# app/views/user_mailer/welcome.html.erb %>
<h1>Hi <%= @user.name %>,</h1>
<p>Thanks for signing up!</p>
<p><%= link_to "Log in", @login_url %></p>

<%# Always provide a text version too %>
<%# app/views/user_mailer/welcome.text.erb %>
Hi <%= @user.name %>,
Thanks for signing up! Log in at: <%= @login_url %>
```

### Sending email

```ruby
# Synchronous (blocks request — avoid in controllers unless very fast)
UserMailer.welcome(user).deliver_now

# Async via Active Job (preferred in controllers)
UserMailer.welcome(user).deliver_later

# Async with delay
UserMailer.password_reset(user, token).deliver_later(wait: 1.minute)
```

**Rule:** Always use `deliver_later` in controllers to avoid blocking the request.

---

## Action Cable (WebSockets)

### Channel

```ruby
# app/channels/notifications_channel.rb
class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    stream_for current_user  # stream scoped to this user
  end

  def unsubscribed
    stop_all_streams
  end
end
```

### Broadcasting from anywhere

```ruby
# From a job, model callback, or controller
NotificationsChannel.broadcast_to(
  user,
  { type: "new_message", message: MessageSerializer.new(message).as_json }
)
```

### JavaScript client (Stimulus/Turbo)

```javascript
// app/javascript/channels/notifications_channel.js
import consumer from "./consumer"

consumer.subscriptions.create("NotificationsChannel", {
  received(data) {
    console.log("Received:", data)
    // Update DOM, show toast, etc.
  }
})
```

### Connection authentication

```ruby
# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      if (user_id = cookies.encrypted[:user_id])
        User.find_by(id: user_id) || reject_unauthorized_connection
      else
        reject_unauthorized_connection
      end
    end
  end
end
```

## Docs

- https://guides.rubyonrails.org/active_job_basics.html
- https://guides.rubyonrails.org/action_mailer_basics.html
- https://guides.rubyonrails.org/action_cable_overview.html
