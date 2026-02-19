# core-mvc-request-lifecycle

Why it matters: understanding the full request pipeline prevents misplaced logic, missed middleware, and unexplained behavior in Rails apps.

## The Rails Request Pipeline

```
Browser Request
  └── Router (config/routes.rb)
        └── Middleware Stack (Rack)
              └── Controller Action
                    ├── Before/Around/After filters
                    ├── Business logic
                    └── Response
                          ├── render (view → HTML)
                          ├── redirect_to
                          └── render json: (API)
```

## Incorrect

```ruby
# Putting business logic directly in the view
# app/views/posts/index.html.erb
<% @posts = Post.where(published: true).order(:created_at) %>
```

Logic in views is untestable, hard to reuse, and breaks MVC separation.

## Correct

```ruby
# app/controllers/posts_controller.rb
class PostsController < ApplicationController
  def index
    @posts = Post.published.ordered  # delegate to model scope
  end
end

# app/models/post.rb
class Post < ApplicationRecord
  scope :published, -> { where(published: true) }
  scope :ordered,   -> { order(:created_at) }
end

# app/views/posts/index.html.erb
<% @posts.each do |post| %>
  <%= render post %>
<% end %>
```

## MVC Responsibilities

| Layer | Responsibility | What to avoid |
|-------|---------------|---------------|
| **Model** | Data, business rules, validations, queries | HTTP concerns, rendering |
| **Controller** | Orchestration, auth checks, assigns `@vars` | Complex queries, view logic |
| **View** | Presentation, formatting | DB calls, business logic |

## Controller conventions

```ruby
class ArticlesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_article, only: [:show, :edit, :update, :destroy]

  def index
    @articles = Article.all
  end

  def show; end  # @article set by before_action

  def create
    @article = Article.new(article_params)
    if @article.save
      redirect_to @article, notice: "Article created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_article
    @article = Article.find(params[:id])
  end

  def article_params
    params.require(:article).permit(:title, :body, :published)
  end
end
```

Key points:
- Use `before_action` for shared setup, not inline repetition
- Always use strong parameters (`permit`) — never `params[:article]` directly
- On failed save, `render` (not `redirect_to`) to preserve `@article` errors
- Return `status: :unprocessable_entity` on validation failure (HTTP 422)

## Docs

- https://guides.rubyonrails.org/getting_started.html
- https://guides.rubyonrails.org/action_controller_overview.html
