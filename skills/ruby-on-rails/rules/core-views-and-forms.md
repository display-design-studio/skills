# core-views-and-forms

Why it matters: well-structured views using Rails helpers prevent XSS vulnerabilities, reduce duplication, and keep presentation logic separate from business logic.

## ERB and Auto-escaping

```erb
<%# Incorrect — raw output, XSS risk %>
<%= raw user_input %>
<%= user.bio.html_safe %>  <%# only use if content is truly trusted %>

<%# Correct — Rails auto-escapes by default %>
<%= user.name %>
<%= user.bio %>

<%# Explicitly sanitize external HTML content %>
<%= sanitize user.bio, tags: %w[p b i a], attributes: %w[href] %>
```

**Rule:** Never call `html_safe` or `raw` on user-supplied content. Trust Rails' auto-escaping.

## Layouts and Partials

```erb
<%# app/views/layouts/application.html.erb %>
<!DOCTYPE html>
<html>
  <head>
    <title><%= content_for?(:title) ? yield(:title) : "My App" %></title>
    <%= stylesheet_link_tag "application" %>
    <%= javascript_importmap_tags %>
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
  </head>
  <body>
    <%= render "shared/navbar" %>
    <main>
      <%= yield %>
    </main>
  </body>
</html>

<%# In a view — set page-specific content %>
<% content_for :title, "Edit #{@post.title}" %>
```

```erb
<%# Rendering a partial with locals — explicit over implicit %>
<%# Incorrect %>
<% @posts.each do |post| %>
  <%= render "post" %>  <%# relies on @post magic %>
<% end %>

<%# Correct %>
<%= render partial: "post", collection: @posts, as: :post %>
<%# or shorthand: %>
<%= render @posts %>

<%# Partial _post.html.erb receives `post` local variable %>
<article>
  <h2><%= link_to post.title, post %></h2>
  <p><%= post.body.truncate(200) %></p>
</article>
```

## Form Helpers

```erb
<%# Model-backed form (preferred) %>
<%= form_with model: @post do |form| %>
  <div>
    <%= form.label :title %>
    <%= form.text_field :title, class: "input" %>
    <% @post.errors.full_messages_for(:title).each do |msg| %>
      <span class="error"><%= msg %></span>
    <% end %>
  </div>

  <div>
    <%= form.label :body %>
    <%= form.text_area :body, rows: 6 %>
  </div>

  <div>
    <%= form.label :category_id, "Category" %>
    <%= form.collection_select :category_id, Category.all, :id, :name, prompt: "Select..." %>
  </div>

  <%= form.submit "Save Post", class: "btn" %>
<% end %>
```

```erb
<%# Non-model form (search, filters) %>
<%= form_with url: search_path, method: :get do |form| %>
  <%= form.text_field :query, placeholder: "Search..." %>
  <%= form.submit "Search" %>
<% end %>
```

## View Helpers (custom)

```ruby
# app/helpers/posts_helper.rb
module PostsHelper
  def status_badge(post)
    css = post.published? ? "badge-green" : "badge-gray"
    content_tag(:span, post.status.humanize, class: "badge #{css}")
  end
end
```

```erb
<%# Usage in view %>
<%= status_badge(@post) %>
```

## Action View built-in helpers

```erb
<%# Links and URLs %>
<%= link_to "Read more", post_path(@post), class: "btn" %>
<%= link_to "Delete", @post, data: { turbo_method: :delete, turbo_confirm: "Are you sure?" } %>

<%# Images %>
<%= image_tag "logo.png", alt: "Logo", width: 200 %>

<%# Dates and numbers %>
<%= time_ago_in_words(@post.created_at) %> ago
<%= number_to_currency(99.95) %>
<%= number_with_delimiter(1_000_000) %>
```

## Docs

- https://guides.rubyonrails.org/action_view_overview.html
- https://guides.rubyonrails.org/layouts_and_rendering.html
- https://guides.rubyonrails.org/form_helpers.html
- https://guides.rubyonrails.org/action_view_helpers.html
