# llms.txt — AI-Friendly Documentation

## Why it matters

AI coding tools (Claude, ChatGPT, Cursor, Windsurf) cannot browse full documentation
sites. `llms.txt` is a lightweight standard that exposes a site's documentation as
Markdown-formatted links, small enough to fit in an AI context window and fetch on demand.

---

## What is llms.txt

`llms.txt` is a standard proposed by [llmstxt.org](https://llmstxt.org). The file is
served at the root of a domain (`/llms.txt`) and contains:

- A brief description of the site
- Markdown links to the most important documentation pages

A companion file `/llms-full.txt` contains the full text of all pages, useful for
deep research queries (but significantly larger — 200K+ tokens for large doc sites).

---

## Incorrect

```
// Expecting @nuxtjs/robots to generate llms.txt automatically
// ❌ @nuxtjs/robots does NOT generate llms.txt
```

---

## Correct

`@nuxtjs/robots` does **not** generate `llms.txt`. Create the file manually and place
it in `public/` — Nuxt serves everything in `public/` as a static asset at the root path.

```
public/
└── llms.txt   ← served at https://yourdomain.com/llms.txt
```

### Minimal `public/llms.txt` structure

```markdown
# Your Site Name

> Brief one-line description of the site.

## Docs

- [Getting started](/docs/getting-started): Overview and installation
- [Configuration](/docs/configuration): All config options
- [API reference](/docs/api): Full API reference
```

---

## Using nuxtseo.com docs with AI tools

The [nuxtseo.com](https://nuxtseo.com) documentation site publishes its own `llms.txt`,
useful for asking AI tools about `@nuxtjs/robots`, `@nuxtjs/sitemap`, and other modules
in the suite.

| Resource | Size | Best for |
|----------|------|----------|
| `https://nuxtseo.com/llms.txt` | ~5K tokens | Quick overview, module index |
| `https://nuxtseo.com/llms-full.txt` | 200K+ tokens | Full docs for deep research |

### Cursor / Windsurf

Use the `@URL` syntax in chat to attach the content:

```
@https://nuxtseo.com/llms.txt
```

The tool fetches and indexes the content before responding.

### Claude / ChatGPT

Paste the URL directly in the prompt:

```
Read https://nuxtseo.com/llms.txt and then explain how to configure the global OG image with @nuxtjs/seo
```

---

## Official docs

- llmstxt.org standard: https://llmstxt.org
- nuxt-seo llms.txt guide: https://nuxtseo.com/docs/nuxt-seo/guides/llms-txt
