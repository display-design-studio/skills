# core-routing-and-controllers

Why it matters: the router is the entry point of every request; poorly structured routes and controllers lead to hard-to-maintain apps, security gaps (missing strong params), and confusing code.

## RESTful Routes

```ruby
# config/routes.rb

Rails.application.routes.draw do
  # Standard 7 REST actions: index, show, new, create, edit, update, destroy
  resources :articles

  # Nested resources (max 1 level deep)
  resources :articles do
    resources :comments, only: [:create, :destroy]
  end

  # Namespace for admin area
  namespace :admin do
    resources :users, only: [:index, :show, :destroy]
  end

  # Singleton resource (no :id, e.g. current user profile)
  resource :profile, only: [:show, :edit, :update]

  # Custom member/collection routes
  resources :posts do
    member  { patch :publish }    # /posts/:id/publish
    collection { get :archived }  # /posts/archived
  end

  root "home#index"
end
```

**Rule:** Nest no more than 1 level deep. Use shallow nesting for deeper hierarchies.

```ruby
# Shallow nesting — index/new/create scoped, show/edit/update/destroy not
resources :articles do
  resources :comments, shallow: true
end
```

## Strong Parameters

```ruby
# Incorrect — mass assignment vulnerability
@user = User.new(params[:user])

# Correct
@user = User.new(user_params)

private

def user_params
  params.require(:user).permit(:name, :email, :role)
  # NEVER permit :admin, :is_superuser without explicit authorization check
end
```

## Before Actions (Filters)

```ruby
class PostsController < ApplicationController
  before_action :authenticate_user!           # Devise / custom auth
  before_action :set_post, only: %i[show edit update destroy]
  before_action :authorize_author!, only: %i[edit update destroy]

  def show; end
  def edit; end
  def update
    if @post.update(post_params)
      redirect_to @post, notice: "Updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def authorize_author!
    redirect_to root_path, alert: "Not authorized." unless @post.author == current_user
  end

  def post_params
    params.require(:post).permit(:title, :body, :published)
  end
end
```

## Sessions and Cookies

```ruby
# Session (server-side, encrypted cookie by default in Rails)
session[:user_id] = user.id
session.delete(:user_id)

# Signed cookies (tamper-proof, readable by client)
cookies.signed[:token] = { value: token, expires: 30.days }

# Encrypted cookies (tamper-proof AND unreadable by client)
cookies.encrypted[:auth_token] = { value: token, httponly: true, secure: Rails.env.production? }
```

## Flash Messages

```ruby
# Set in controller
redirect_to @post, notice: "Post created!"   # sets flash[:notice]
redirect_to root_path, alert: "Not found."   # sets flash[:alert]

# Display in layout (app/views/layouts/application.html.erb)
<% flash.each do |type, message| %>
  <div class="alert alert-<%= type %>"><%= message %></div>
<% end %>
```

## Respond to multiple formats

```ruby
def show
  @post = Post.find(params[:id])
  respond_to do |format|
    format.html
    format.json { render json: @post }
  end
end
```

## Docs

- https://guides.rubyonrails.org/routing.html
- https://guides.rubyonrails.org/action_controller_overview.html
- https://guides.rubyonrails.org/action_controller_advanced_topics.html
