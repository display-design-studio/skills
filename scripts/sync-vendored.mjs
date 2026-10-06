#!/usr/bin/env node
// Compacts vendored upstream skills into one skill per domain (router SKILL.md + references/).
//
//   node scripts/sync-vendored.mjs            regenerate every group in scripts/vendor-map.json
//   node scripts/sync-vendored.mjs gsap       regenerate one group
//   node scripts/sync-vendored.mjs --check    regenerate in a temp dir and fail on any diff
//
// Per upstream skill <vendor>/skills/<name>/:
//   SKILL.md          -> skills/<group>/references/<short>.md   (frontmatter stripped)
//   other files/dirs  -> skills/<group>/references/<short>/...
// The router skills/<group>/SKILL.md is first-party: only the block between
// <!-- BEGIN TOPICS --> and <!-- END TOPICS --> is regenerated from the upstream descriptions.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
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

function rewriteLinks(body, cfg, dir = '') {
  const names = cfg.skills.map((s) => s.slice(cfg.prefix.length)).join('|')
  const re = new RegExp(`(\\*\\*)?\\b${cfg.prefix}(${names})\\b(?![\\w-])(\\*\\*)?`, 'g')
  return body.replace(re, (_, _a, short) => `[${short}](${dir}${short}.md)`)
}

function compact(group, cfg, skillsDir) {
  const groupDir = join(skillsDir, group)
  const refs = join(groupDir, 'references')
  rmSync(refs, { recursive: true, force: true })
  mkdirSync(refs, { recursive: true })
  const rows = []

  for (const name of cfg.skills) {
    const short = name.slice(cfg.prefix.length)
    const src = join(ROOT, 'vendor', cfg.vendor, 'skills', name)
    if (!existsSync(join(src, 'SKILL.md'))) throw new Error(`missing upstream skill: ${src}`)
    const { fm, body } = splitFrontmatter(readFileSync(join(src, 'SKILL.md'), 'utf8'))
    let out = rewriteLinks(body, cfg)
    if (cfg.patches?.[name]) out = out.replace(/\n*$/, '\n') + readFileSync(join(ROOT, cfg.patches[name]), 'utf8')
    writeFileSync(join(refs, `${short}.md`), out.replace(/\n*$/, '\n'))
    for (const entry of readdirSync(src)) {
      if (entry === 'SKILL.md') continue
      cpSync(join(src, entry), join(refs, short, entry), { recursive: true })
    }
    rows.push(`| [\`${short}\`](references/${short}.md) | ${rewriteLinks(readDescription(fm), cfg, 'references/').replace(/\|/g, '\\|')} |`)
  }

  const routerPath = join(groupDir, 'SKILL.md')
  const router = readFileSync(routerPath, 'utf8')
  const a = router.indexOf(BEGIN)
  const b = router.indexOf(END)
  if (a < 0 || b < a) throw new Error(`${routerPath}: topic markers not found`)
  const table = ['| topic | use it when |', '| --- | --- |', ...rows].join('\n')
  writeFileSync(routerPath, `${router.slice(0, a + BEGIN.length)}\n${table}\n${router.slice(b)}`)
}

const args = process.argv.slice(2)
const check = args.includes('--check')
const only = args.filter((a) => !a.startsWith('--'))
const groups = Object.entries(MAP).filter(([g]) => only.length === 0 || only.includes(g))
if (groups.length === 0) throw new Error(`unknown group: ${only.join(', ')}`)

if (!check) {
  for (const [g, cfg] of groups) compact(g, cfg, join(ROOT, 'skills'))
  console.log(`compacted: ${groups.map(([g]) => g).join(', ')}`)
} else {
  const tmp = mkdtempSync(join(tmpdir(), 'compact-'))
  let failed = false
  for (const [g, cfg] of groups) {
    cpSync(join(ROOT, 'skills', g, 'SKILL.md'), join(tmp, g, 'SKILL.md'), { recursive: true })
    compact(g, cfg, tmp)
    try {
      execFileSync('diff', ['-r', join(tmp, g), join(ROOT, 'skills', g)], { stdio: 'inherit' })
    } catch {
      failed = true
      console.error(`DRIFT in skills/${g}: run \`node scripts/sync-vendored.mjs ${g}\``)
    }
  }
  rmSync(tmp, { recursive: true, force: true })
  process.exit(failed ? 1 : 0)
}
