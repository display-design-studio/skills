# component-active-storage

Why it matters: Active Storage provides a unified interface for file uploads to disk or cloud services — using it correctly prevents security vulnerabilities, orphaned files, and performance issues with large files.

## Setup

```bash
rails active_storage:install
rails db:migrate
```

```ruby
# config/storage.yml
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>

amazon:
  service: S3
  access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
  secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>
  region: us-east-1
  bucket: my-app-production

# config/environments/production.rb
config.active_storage.service = :amazon

# config/environments/development.rb
config.active_storage.service = :local
```

## Attaching files to models

```ruby
class User < ApplicationRecord
  has_one_attached  :avatar              # single file
  has_many_attached :documents           # multiple files

  # Validation (requires active_storage_validations gem or manual)
  validate :avatar_content_type

  private

  def avatar_content_type
    return unless avatar.attached?
    unless avatar.content_type.in?(%w[image/jpeg image/png image/webp])
      errors.add(:avatar, "must be a JPEG, PNG, or WebP image")
    end
  end
end
```

## Controller — accepting uploads

```ruby
class UsersController < ApplicationController
  def update
    if @user.update(user_params)
      redirect_to @user
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def user_params
    # Include :avatar in permitted params
    params.require(:user).permit(:name, :email, :avatar, documents: [])
  end
end
```

## View — upload form

```erb
<%= form_with model: @user do |form| %>
  <%# Single file %>
  <div>
    <%= form.label :avatar, "Profile photo" %>
    <%= form.file_field :avatar, accept: "image/jpeg,image/png,image/webp" %>
  </div>

  <%# Multiple files %>
  <div>
    <%= form.label :documents, "Attach documents" %>
    <%= form.file_field :documents, multiple: true %>
  </div>

  <%= form.submit "Save" %>
<% end %>
```

## Displaying attachments

```erb
<%# Image with variant (resize on-the-fly — requires libvips or ImageMagick) %>
<% if @user.avatar.attached? %>
  <%= image_tag @user.avatar.variant(resize_to_limit: [200, 200]) %>
<% end %>

<%# Download link %>
<%= link_to "Download", rails_blob_path(@document, disposition: "attachment") %>

<%# Inline display %>
<%= link_to "View", rails_blob_path(@document, disposition: "inline") %>
```

## Purging (deleting) attachments

```ruby
# Purge immediately (synchronous)
user.avatar.purge

# Purge asynchronously (preferred for large files)
user.avatar.purge_later
```

## Security rules

- **Validate content type** server-side — never trust the browser's MIME type.
- **Validate file size** to prevent storage abuse:

```ruby
validate :avatar_size

def avatar_size
  return unless avatar.attached?
  if avatar.byte_size > 5.megabytes
    errors.add(:avatar, "must be less than 5 MB")
  end
end
```

- **Use signed URLs** for private files on S3 — never expose bucket URLs directly.
- Store uploads **outside** `public/` in production (use cloud storage or `storage/`).

## Docs

- https://guides.rubyonrails.org/active_storage_overview.html
