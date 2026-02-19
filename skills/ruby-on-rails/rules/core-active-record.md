# core-active-record

Why it matters: Active Record is the data layer of every Rails app — correct use of queries, associations, validations, and migrations prevents N+1 problems, data integrity issues, and slow deployments.

## Queries

### Incorrect — N+1 query

```ruby
# Runs 1 query for posts + 1 query per post for author
Post.all.each do |post|
  puts post.author.name
end
```

### Correct — eager loading

```ruby
Post.includes(:author).each do |post|
  puts post.author.name
end

# Selective includes with conditions
Post.includes(:comments).where(published: true).order(created_at: :desc)
```

### Named scopes (preferred over raw where chains)

```ruby
class Post < ApplicationRecord
  scope :published,  -> { where(published: true) }
  scope :recent,     -> { order(created_at: :desc) }
  scope :by_author,  ->(author) { where(author: author) }

  # Combine scopes
  scope :published_recent, -> { published.recent }
end

# Usage
Post.published.recent.limit(10)
Post.by_author(current_user).published
```

### Avoid loading everything into memory

```ruby
# Incorrect for large datasets
Post.all.each { |p| p.update(...)  }

# Correct — batched processing
Post.find_each(batch_size: 500) { |p| p.update(...) }
Post.in_batches(of: 200).update_all(archived: true)
```

## Associations

```ruby
class User < ApplicationRecord
  has_many :posts, dependent: :destroy
  has_many :published_posts, -> { published }, class_name: "Post"
  has_one  :profile, dependent: :destroy
  has_many :comments, through: :posts
end

class Post < ApplicationRecord
  belongs_to :user
  belongs_to :category, optional: true  # optional: true = nullable FK
  has_many   :comments, dependent: :destroy
  has_many   :tags, through: :post_tags
end
```

- Always declare `dependent:` on `has_many`/`has_one` to avoid orphaned records.
- Use `optional: true` on `belongs_to` when the FK is nullable (Rails 5+ default is required).

## Validations

```ruby
class User < ApplicationRecord
  validates :email,    presence: true, uniqueness: { case_sensitive: false },
                       format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :username, presence: true, length: { minimum: 3, maximum: 30 },
                       format: { with: /\A[a-z0-9_]+\z/ }
  validates :age,      numericality: { greater_than: 0 }, allow_nil: true

  validate :email_not_disposable  # custom validator

  private

  def email_not_disposable
    errors.add(:email, "cannot be a disposable address") if DisposableEmail.blocked?(email)
  end
end
```

- Prefer model-level validations over DB constraints alone (gives user-facing error messages).
- Add DB-level constraints too as a safety net (uniqueness index, NOT NULL).

## Migrations

```ruby
class AddStatusToPosts < ActiveRecord::Migration[8.1]
  def change
    add_column :posts, :status, :string, null: false, default: "draft"
    add_index  :posts, :status
  end
end

# Add a foreign key properly
class AddAuthorRefToPosts < ActiveRecord::Migration[8.1]
  def change
    add_reference :posts, :author, null: false, foreign_key: { to_table: :users }
  end
end
```

Rules:
- Always set `null: false` on required columns; use DB constraints to back validations.
- Add indexes on columns used in `WHERE`, `ORDER BY`, or `JOIN`.
- Use `change` method for reversible migrations; use `up`/`down` only when needed.
- Never edit a migration that has already been run — create a new one.

## Callbacks — use sparingly

```ruby
# Incorrect — side effects in callbacks are hard to test and surprising
class Order < ApplicationRecord
  after_create :send_confirmation_email  # invisible side effect
end

# Correct — explicit in the service object or controller
class OrdersController < ApplicationController
  def create
    @order = Order.new(order_params)
    if @order.save
      OrderMailer.confirmation(@order).deliver_later
      redirect_to @order
    else
      render :new, status: :unprocessable_entity
    end
  end
end
```

Prefer callbacks only for: `before_validation` normalization, `before_destroy` guard checks, `after_commit` for async jobs.

## Docs

- https://guides.rubyonrails.org/active_record_basics.html
- https://guides.rubyonrails.org/active_record_querying.html
- https://guides.rubyonrails.org/association_basics.html
- https://guides.rubyonrails.org/active_record_validations.html
- https://guides.rubyonrails.org/active_record_migrations.html
