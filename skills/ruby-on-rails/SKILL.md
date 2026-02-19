---
name: ruby-on-rails
description: Comprehensive Ruby on Rails 8.1 best-practices skill covering full-stack MVC development, Active Record, routing, views, background jobs, storage, security, testing, and performance. Use when building, reviewing, or debugging Rails applications.
license: MIT
metadata:
  author: display studio
  version: "1.0.0"
  source: https://guides.rubyonrails.org/ (v8.1.2)
---

# Ruby on Rails Best Practices

Full-stack Rails 8.1 guide organized as modular rules. Covers MVC core patterns, Active Record, components (jobs, mailer, cable, storage), security, testing, performance, and debugging.

## When to apply

- Building a new Rails full-stack application or API
- Adding models, controllers, views, or routes to an existing Rails app
- Implementing background jobs, email, WebSockets, or file uploads
- Reviewing Rails code for security, performance, or correctness
- Debugging unexpected behavior in a Rails application

## ROUTING: Which rule file to load

**IF working with models, database queries, associations, validations, or migrations:**
→ Read `rules/core-active-record.md`

**IF working with routes, controllers, params, sessions, cookies, or filters:**
→ Read `rules/core-routing-and-controllers.md`

**IF working with views, layouts, partials, ERB templates, or form helpers:**
→ Read `rules/core-views-and-forms.md`

**IF working with background jobs, emails, or WebSocket channels:**
→ Read `rules/component-jobs-mailer-cable.md`

**IF working with file uploads or cloud storage:**
→ Read `rules/component-active-storage.md`

**IF dealing with security concerns (auth, CSRF, XSS, SQL injection, secrets):**
→ Read `rules/security-best-practices.md`

**IF writing or fixing tests:**
→ Read `rules/testing-patterns.md`

**IF optimizing performance or configuring for production:**
→ Read `rules/perf-caching-and-deployment.md`

**IF debugging an error or unexpected behavior:**
→ Read `rules/debug-tools.md`

**IF new to the MVC request cycle or need a top-level orientation:**
→ Read `rules/core-mvc-request-lifecycle.md` first

## Rule index

| Topic | Description | File |
|-------|-------------|------|
| Sections overview | Categories and reading order | [rules/_sections.md](rules/_sections.md) |
| MVC lifecycle | Request pipeline from router to response | [rules/core-mvc-request-lifecycle.md](rules/core-mvc-request-lifecycle.md) |
| Active Record | Models, queries, associations, validations, migrations | [rules/core-active-record.md](rules/core-active-record.md) |
| Routing & Controllers | RESTful routes, params, callbacks, sessions | [rules/core-routing-and-controllers.md](rules/core-routing-and-controllers.md) |
| Views & Forms | ERB, layouts, partials, form helpers | [rules/core-views-and-forms.md](rules/core-views-and-forms.md) |
| Jobs / Mailer / Cable | ActiveJob, ActionMailer, ActionCable | [rules/component-jobs-mailer-cable.md](rules/component-jobs-mailer-cable.md) |
| Active Storage | File uploads, cloud storage | [rules/component-active-storage.md](rules/component-active-storage.md) |
| Security | CSRF, XSS, SQL injection, secrets, auth | [rules/security-best-practices.md](rules/security-best-practices.md) |
| Testing | Unit, integration, system tests | [rules/testing-patterns.md](rules/testing-patterns.md) |
| Performance & Deploy | Caching strategies, Puma, concurrency | [rules/perf-caching-and-deployment.md](rules/perf-caching-and-deployment.md) |
| Debug | byebug, web console, logging, common errors | [rules/debug-tools.md](rules/debug-tools.md) |

## Rule categories by priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | MVC core patterns | CRITICAL | `core-` |
| 2 | Components | HIGH | `component-` |
| 3 | Security | HIGH | `security-` |
| 4 | Testing | HIGH | `testing-` |
| 5 | Performance & Deploy | MEDIUM-HIGH | `perf-` |
| 6 | Debug | MEDIUM | `debug-` |

## Coverage and maintenance

- Coverage map: `rules/_coverage-map.md`
- Source: https://guides.rubyonrails.org/ (Rails 8.1.2)
- Update this skill when Rails version changes or when new guides are published.

## Rails CLI quick reference

```bash
rails new myapp                      # new full-stack app
rails new myapp --api                # API-only mode
rails generate model Post title:string body:text
rails generate controller Posts index show
rails generate migration AddAuthorToPosts author:references
rails db:migrate
rails db:rollback
rails routes                         # list all routes
rails console                        # interactive REPL
rails test                           # run test suite
rails server                         # start dev server (localhost:3000)
```
