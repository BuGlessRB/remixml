# AGENTS.md

Remixml: a zero-dependency XML/XHTML macro-language templating compiler in
pure JavaScript (ES2018+), for modern browsers and NodeJS.

## Project

- Pure JavaScript only.  No TypeScript, no transpilation, no runtime deps
  (`dependencies` in `package.json` must stay empty, `sideEffects: false`).
- Must run in modern browsers: no Node-only globals (`process`, `Buffer`,
  `fs`, runtime `require`); guard host access with `typeof` checks.
- Source of truth: `remixml.master.js`.  The generated `remixml.js` /
  `remixml.min.js` are build artefacts — never edit them, never touch the
  `Cut` regions or the prepend/externs blocks in the master.
- Shipped code must stay within ES2018 (no `??` / `?.` unless the Closure
  output target guarantees downleveling).

## Commands

- `npm test` — full verification: `./prepfiles && ./runtest.sh`
  (regenerates distribution files, then runs the 51-test testsuite).
- `./prepfiles` — build: extracts marked regions, strips dev sections,
  runs Closure Compiler (advanced mode) to produce `remixml.js` and
  `remixml.min.js`.
- `./runtest.sh` — testsuite driver (node-based; needs `js-beautify`).
- Toolchain caveat: `google-closure-compiler` and `js-beautify` are NOT in
  `devDependencies`; install them (e.g. `npm i -g`) before running the
  build/test commands, and run `npm i --ignore-scripts` for the rest.

## Architecture

See `ARCHITECTURE.md` for the full picture.  Load-bearing parts:

- Compiler (`remixml2js` in `remixml.master.js`) — one-pass parse + codegen
  to a JS function literal, with a peephole pass; sync/async via one flag.
- Loader (`js2obj`) — evaluates generated source into callable templates,
  trapping syntax errors instead of throwing.
- Runtime helpers — context/scoping, node construction, variable evaluation
  (`Z`), insertion (`K`), iteration (`G`), tree transforms (`R`/`WT`),
  output (`abstract2txt` = `Y`), abstract cache (`CG`/`CS`).
- DOM-abstract model — tagged-array trees, the shared format for runner,
  cache and serialisers.
- Extension points — filters, custom tags (`set_tag`), formatting
  (`remixml-fmt`), DOM output via optional `remixml-*dom` modules.

## Conventions

Read `CONVENTIONS.md` (style, formatting, workflow) and `PROMPTS.md` (audit
playbook) — they bind.  Highlights:

- British English in comments/logs/identifiers; terminal period on comments.
- 80-column hard limit; preserve existing indentation exactly.
- No inline comments explaining code changes; never reformat existing
  comments (staircase comment layout is legacy — preserve it).
- No single-use helpers; concise arrow functions; no `async` when returning
  a Promise directly; double quotes preferred.
- Hot path (V8): fixed-shape objects, packed arrays, constant-key property
  access (`obj.prop` / constant `x[""]`, not `obj[key]`); `Map` for caches.
- `execy` is `@noinline` on purpose (Safari sticky-regex bug) — do not
  inline it or remove the guard.
- Errors from template code are trapped and logged, never thrown to the
  page; follow that pattern.

## Notes

(Add quick notes here as they come up.)
