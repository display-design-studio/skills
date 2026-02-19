# Ruby on Rails Rule Sections

This skill is divided by Rails docs-aligned categories.

## 1) MVC Core (`core-`)

Always start here for orientation or full-stack tasks:

- `core-mvc-request-lifecycle.md` — router → middleware → controller → view pipeline
- `core-active-record.md` — models, queries, associations, validations, migrations
- `core-routing-and-controllers.md` — routes, params, callbacks, sessions, cookies
- `core-views-and-forms.md` — ERB, layouts, partials, form helpers

## 2) Components (`component-`)

Load when the feature involves these Rails subsystems:

- `component-jobs-mailer-cable.md` — ActiveJob, ActionMailer, ActionCable
- `component-active-storage.md` — file uploads, cloud storage, variants

## 3) Security (`security-`)

Always load for any feature touching auth, user input, or secrets:

- `security-best-practices.md` — CSRF, XSS, SQL injection, strong parameters, secrets

## 4) Testing (`testing-`)

Load when writing or fixing tests:

- `testing-patterns.md` — unit (model), integration (controller/request), system (browser) tests

## 5) Performance & Deploy (`perf-`)

Load for production concerns:

- `perf-caching-and-deployment.md` — fragment/HTTP caching, Puma concurrency, memory tuning

## 6) Debug (`debug-`)

Load when tracking down errors:

- `debug-tools.md` — byebug, web console, logging, common error patterns

## Suggested reading order

1. `core-mvc-request-lifecycle.md` (orientation)
2. `core-active-record.md` (data layer)
3. `core-routing-and-controllers.md` (request handling)
4. `core-views-and-forms.md` (presentation)
5. `security-best-practices.md` (always relevant)
6. Feature-specific component rules
7. `testing-patterns.md`
8. `perf-caching-and-deployment.md` + `debug-tools.md`
