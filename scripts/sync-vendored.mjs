#!/usr/bin/env node
// Compacts vendored upstream skills into one skill per domain (router SKILL.md + references/).
//
//   node scripts/sync-vendored.mjs            regenerate every group in scripts/vendor-map.json
//   node scripts/sync-vendored.mjs gsap       regenerate one group
//   node scripts/sync-vendored.mjs --check    regenerate in a temp dir and fail on any diff
//   node scripts/sync-vendored.mjs --vendors  print the vendor submodules the map needs
//
// Per upstream skill <vendor>/skills/<name>/:
//   SKILL.md          -> skills/<group>/references/<short>.md   (frontmatter stripped)
//   other files/dirs  -> skills/<group>/references/<short>/...
// mode "copy" (a skill that upstream already ships as one unit, e.g. Shopify): copies skills/<name> as is, then
//   stripFrontmatter  removes top-level frontmatter keys (and their indented children) that skills-ref rejects
//   remove            deletes files (telemetry hook scripts)
//   disableTelemetry  prepends OPT_OUT_INSTRUMENTATION=true to every scripts/*.mjs, so telemetry is off
//                     regardless of the user's environment (documented opt-out of the upstream scripts)
//
// Relative paths a skill body uses for its own files (references/x.md, RECIPES.md) are rewritten to
// <short>/<path>; mentions of other mapped skills with a hyphen in the name become links.
// The router skills/<group>/SKILL.md is first-party: only the block between
// <!-- BEGIN TOPICS --> and <!-- END TOPICS --> is regenerated from the upstream descriptions.
// Upstream skills that are neither in `skills` nor in `ignore` raise a warning (new upstream skill);
// a mapped skill missing upstream is a hard error (removed or renamed upstream).
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MAP = JSON.parse(readFileSync(join(ROOT, 'scripts/vendor-map.json'), 'utf8'))
const BEGIN = '<!-- BEGIN TOPICS -->'
const END = '<!-- END TOPICS -->'

function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) throw new Error('missing frontmatter')
  return { fm: m[1], body: text.slice(m[0].length).replace(/^\n+/, '') }
}

// Minimal reader for `description:` (plain, quoted, or folded block scalar).
function readDescription(fm) {
  const lines = fm.split('\n')
  const i = lines.findIndex((l) => l.startsWith('description:'))
  if (i < 0) throw new Error('missing description')
  let value = lines[i].slice('description:'.length).trim()
  if (/^[>|][-+]?$/.test(value)) {
    const parts = []
    for (let j = i + 1; j < lines.length && /^\s/.test(lines[j]); j++) parts.push(lines[j].trim())
    value = parts.join(' ')
  }
  return value.replace(/^(["'])([\s\S]*)\1$/, '$2').replace(/\s+/g, ' ').trim()
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Mentions of other mapped skills (**name**, `name` or bare) -> link. Only hyphenated names are
// rewritten: a bare word like "animate" is far too common to touch.
function rewriteLinks(body, cfg, dir = '') {
  const prefix = cfg.prefix ?? ''
  const alt = cfg.skills.filter((n) => n.includes('-')).sort((a, b) => b.length - a.length).map(escapeRe).join('|')
  if (!alt) return body
  const re = new RegExp(`(?<![\\w./-])(\\*\\*|\`)?(${alt})\\1?(?![\\w-])`, 'g')
  return body.replace(re, (_, _w, name) => {
    const short = name.slice(prefix.length)
    return `[${short}](${dir}${short}.md)`
  })
}

// Files shipped next to SKILL.md move to references/<short>/, so paths the body uses for them change.
function listFiles(dir, base = '') {
  return readdirSync(join(dir, base)).flatMap((e) => {
    const rel = base ? `${base}/${e}` : e
    return statSync(join(dir, rel)).isDirectory() ? listFiles(dir, rel) : [rel]
  })
}

function rewritePaths(body, short, files) {
  let out = body
  for (const f of [...files].sort((a, b) => b.length - a.length)) {
    out = out.replace(new RegExp(`(?<![\\w./-])${escapeRe(f)}(?![\\w-])`, 'g'), `${short}/${f}`)
  }
  return out
}

function warnUnlisted(cfg, group) {
  const dir = join(ROOT, 'vendor', cfg.vendor, 'skills')
  for (const e of readdirSync(dir)) {
    if (!statSync(join(dir, e)).isDirectory()) continue
    if (cfg.skills.includes(e) || cfg.ignore?.includes(e)) continue
    console.warn(`::warning::${group}: new upstream skill "${e}" in ${cfg.vendor} is not in vendor-map.json (add to "skills" or "ignore")`)
  }
}

function warnBrokenLinks(group, groupDir) {
  const broken = []
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      const f = join(d, e)
      if (statSync(f).isDirectory()) walk(f)
      else if (e.endsWith('.md')) {
        for (const m of readFileSync(f, 'utf8').matchAll(/\]\(([^)\s]+)\)/g)) {
          const target = m[1].split('#')[0]
          if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue
          if (!existsSync(resolve(dirname(f), target))) broken.push(`${f.slice(groupDir.length + 1)} -> ${target}`)
        }
      }
    }
  }
  walk(groupDir)
  if (broken.length) console.warn(`warning: ${group}: ${broken.length} broken relative link(s), e.g. ${broken.slice(0, 3).join('; ')}`)
}

function compact(group, cfg, skillsDir) {
  const groupDir = join(skillsDir, group)
  const refs = join(groupDir, 'references')
  rmSync(refs, { recursive: true, force: true })
  mkdirSync(refs, { recursive: true })
  const rows = []

  for (const name of cfg.skills) {
    const short = name.slice((cfg.prefix ?? '').length)
    const src = join(ROOT, 'vendor', cfg.vendor, 'skills', name)
    if (!existsSync(join(src, 'SKILL.md'))) throw new Error(`missing upstream skill: ${src}`)
    const { fm, body } = splitFrontmatter(readFileSync(join(src, 'SKILL.md'), 'utf8'))
    const extras = readdirSync(src).filter((e) => e !== 'SKILL.md')
    const files = extras.flatMap((e) => (statSync(join(src, e)).isDirectory() ? listFiles(src, e) : [e]))
    let out = rewritePaths(rewriteLinks(body, cfg), short, files)
    if (cfg.patches?.[name]) out = out.replace(/\n*$/, '\n') + readFileSync(join(ROOT, cfg.patches[name]), 'utf8')
    writeFileSync(join(refs, `${short}.md`), out.replace(/\n*$/, '\n'))
    for (const entry of extras) {
      cpSync(join(src, entry), join(refs, short, entry), { recursive: true })
    }
    rows.push(`| [\`${short}\`](references/${short}.md) | ${rewriteLinks(readDescription(fm), cfg, 'references/').replace(/\|/g, '\\|')} |`)
  }

  warnUnlisted(cfg, group)
  const routerPath = join(groupDir, 'SKILL.md')
  const router = readFileSync(routerPath, 'utf8')
  const a = router.indexOf(BEGIN)
  const b = router.indexOf(END)
  if (a < 0 || b < a) throw new Error(`${routerPath}: topic markers not found`)
  const table = ['| topic | use it when |', '| --- | --- |', ...rows].join('\n')
  writeFileSync(routerPath, `${router.slice(0, a + BEGIN.length)}\n${table}\n${router.slice(b)}`)
  warnBrokenLinks(group, groupDir)
}

function stripFrontmatterKeys(text, keys) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) throw new Error('missing frontmatter')
  const out = []
  let skipping = false
  for (const line of m[1].split('\n')) {
    const key = line.match(/^([A-Za-z_-]+):/)?.[1]
    if (key) skipping = keys.includes(key)
    else if (!/^\s/.test(line) && line !== '') skipping = false
    if (!skipping) out.push(line)
  }
  return `---\n${out.join('\n')}\n---\n${text.slice(m[0].length)}`
}

const OPT_OUT_LINE = "process.env.OPT_OUT_INSTRUMENTATION = 'true' // display studio: upstream telemetry disabled"

function disableTelemetry(scriptsDir) {
  if (!existsSync(scriptsDir)) return
  for (const f of readdirSync(scriptsDir)) {
    if (!f.endsWith('.mjs')) continue
    const p = join(scriptsDir, f)
    const text = readFileSync(p, 'utf8')
    const nl = text.startsWith('#!') ? text.indexOf('\n') + 1 : 0
    writeFileSync(p, `${text.slice(0, nl)}${OPT_OUT_LINE}\n${text.slice(nl)}`)
  }
}

function copySkills(group, cfg, skillsDir) {
  for (const name of cfg.skills) {
    const src = join(ROOT, 'vendor', cfg.vendor, 'skills', name)
    if (!existsSync(join(src, 'SKILL.md'))) throw new Error(`missing upstream skill: ${src}`)
    const dest = join(skillsDir, name)
    rmSync(dest, { recursive: true, force: true })
    cpSync(src, dest, { recursive: true })
    for (const f of cfg.remove ?? []) rmSync(join(dest, f), { force: true })
    if (cfg.stripFrontmatter?.length) {
      const sk = join(dest, 'SKILL.md')
      writeFileSync(sk, stripFrontmatterKeys(readFileSync(sk, 'utf8'), cfg.stripFrontmatter))
    }
    if (cfg.disableTelemetry) disableTelemetry(join(dest, 'scripts'))
  }
  warnUnlisted(cfg, group)
}

const args = process.argv.slice(2)
if (args.includes('--vendors')) {
  console.log([...new Set(Object.values(MAP).map((c) => `vendor/${c.vendor}`))].join(' '))
  process.exit(0)
}
const check = args.includes('--check')
const only = args.filter((a) => !a.startsWith('--'))
const groups = Object.entries(MAP).filter(([g]) => only.length === 0 || only.includes(g))
if (groups.length === 0) throw new Error(`unknown group: ${only.join(', ')}`)

if (!check) {
  for (const [g, cfg] of groups) (cfg.mode === 'copy' ? copySkills : compact)(g, cfg, join(ROOT, 'skills'))
  console.log(`compacted: ${groups.map(([g]) => g).join(', ')}`)
} else {
  const tmp = mkdtempSync(join(tmpdir(), 'compact-'))
  let failed = false
  for (const [g, cfg] of groups) {
    const pairs = []
    if (cfg.mode === 'copy') {
      copySkills(g, cfg, tmp)
      for (const name of cfg.skills) pairs.push([join(tmp, name), join(ROOT, 'skills', name)])
    } else {
      // first-party files (router, rules/) are inputs; references/ is the generated output
      cpSync(join(ROOT, 'skills', g), join(tmp, g), { recursive: true })
      compact(g, cfg, tmp)
      pairs.push([join(tmp, g), join(ROOT, 'skills', g)])
    }
    for (const [a, b] of pairs) {
      try {
        execFileSync('diff', ['-r', a, b], { stdio: 'inherit' })
      } catch {
        failed = true
        console.error(`DRIFT in ${b.slice(ROOT.length + 1)}: run \`node scripts/sync-vendored.mjs ${g}\``)
      }
    }
  }
  rmSync(tmp, { recursive: true, force: true })
  process.exit(failed ? 1 : 0)
}
