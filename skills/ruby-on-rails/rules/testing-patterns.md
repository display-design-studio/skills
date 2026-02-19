# testing-patterns

Why it matters: Rails ships with a full test suite infrastructure — using it correctly gives fast, reliable feedback and catches regressions before production.

## Test types and when to use them

| Type | What to test | Speed | File location |
|------|-------------|-------|---------------|
| **Unit / Model** | Validations, scopes, methods, callbacks | Fast | `test/models/` |
| **Controller / Request** | HTTP layer, auth, routing, JSON responses | Medium | `test/controllers/` or `test/requests/` |
| **Integration** | Multi-step workflows across controllers | Medium | `test/integration/` |
| **System** | Full browser flows (Capybara + real browser) | Slow | `test/system/` |

## Model Tests

```ruby
# test/models/user_test.rb
require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "is invalid without email" do
    user = User.new(email: nil, password: "password123456")
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "is invalid with duplicate email" do
    existing = users(:alice)
    user = User.new(email: existing.email, password: "password123456")
    assert_not user.valid?
  end

  test "published scope returns only published posts" do
    assert_includes Post.published, posts(:published_post)
    assert_not_includes Post.published, posts(:draft_post)
  end
end
```

## Fixtures

```yaml
# test/fixtures/users.yml
alice:
  email: alice@example.com
  password_digest: <%= BCrypt::Password.create("password123456") %>
  role: user

admin:
  email: admin@example.com
  password_digest: <%= BCrypt::Password.create("adminpassword") %>
  role: admin
```

## Request Tests (preferred over controller tests in Rails 5+)

```ruby
# test/requests/posts_test.rb
require "test_helper"

class PostsRequestTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:alice)
    sign_in @user  # helper from Devise test helpers, or set session manually
    @post = posts(:draft_post)
  end

  test "GET /posts returns 200" do
    get posts_path
    assert_response :success
  end

  test "POST /posts creates a post" do
    assert_difference("Post.count", 1) do
      post posts_path, params: { post: { title: "New Post", body: "Content", published: false } }
    end
    assert_redirected_to post_path(Post.last)
  end

  test "PATCH /posts/:id unauthorized returns redirect" do
    other_post = posts(:others_post)
    patch post_path(other_post), params: { post: { title: "Hijack" } }
    assert_redirected_to root_path
  end

  test "DELETE /posts/:id destroys post" do
    assert_difference("Post.count", -1) do
      delete post_path(@post)
    end
    assert_redirected_to posts_path
  end
end
```

## System Tests (browser)

```ruby
# test/system/posts_test.rb
require "application_system_test_case"

class PostsSystemTest < ApplicationSystemTestCase
  driven_by :selenium, using: :headless_chrome

  setup do
    @user = users(:alice)
    sign_in @user
  end

  test "creating a post" do
    visit new_post_path
    fill_in "Title", with: "My System Test Post"
    fill_in "Body",  with: "Written via browser test."
    click_on "Save Post"
    assert_text "Post created"
    assert_current_path post_path(Post.last)
  end
end
```

## Mailer Tests

```ruby
# test/mailers/user_mailer_test.rb
class UserMailerTest < ActionMailer::TestCase
  test "welcome email" do
    user = users(:alice)
    email = UserMailer.welcome(user)

    assert_emails 1 do
      email.deliver_now
    end

    assert_equal ["noreply@example.com"], email.from
    assert_equal [user.email], email.to
    assert_equal "Welcome to MyApp!", email.subject
    assert_match user.name, email.body.encoded
  end
end
```

## Job Tests

```ruby
# test/jobs/send_welcome_email_job_test.rb
class SendWelcomeEmailJobTest < ActiveJob::TestCase
  test "enqueues the job" do
    assert_enqueued_with(job: SendWelcomeEmailJob) do
      SendWelcomeEmailJob.perform_later(users(:alice).id)
    end
  end

  test "performs without error" do
    assert_nothing_raised do
      perform_enqueued_jobs do
        SendWelcomeEmailJob.perform_later(users(:alice).id)
      end
    end
  end
end
```

## Running Tests

```bash
rails test                        # all tests
rails test test/models/           # only model tests
rails test test/models/user_test.rb
rails test test/models/user_test.rb:15  # specific line
rails test:system                 # system tests only
```

## Docs

- https://guides.rubyonrails.org/testing.html
