# AGENTS.md

Remixml: a zero-dependency XML/XHTML macro-language templating compiler in
pure JavaScript (ES2018+), for modern browsers and NodeJS.

## Project

- Source of truth: `remixml.master.js`; the generated `remixml.js` /
  `remixml.min.js` are build artefacts — never edit them, never touch the
  `Cut` regions or the prepend/externs blocks in the master.

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

See `ARCHITECTURE.md` for the full picture.  Load-bearing internals (names
to grep for in `remixml.master.js`): compiler `remixml2js`, loader
`js2obj`, variable evaluation `Z`, insertion `K`, iteration `G`, tree
transforms `R`/`WT`, output `abstract2txt` = `Y`, abstract cache `CG`/`CS`,
custom tags via `set_tag`.

## Conventions

Read `CONVENTIONS.md` (style, formatting, workflow) and `PROMPTS.md` (audit
playbook) — they bind.  Repo-specific rules to note:

- `execy` is `@noinline` on purpose (Safari sticky-regex bug) — do not
  inline it or remove the guard.
- Errors from template code are trapped and logged, never thrown to the
  page; follow that pattern.

## Notes

(Add quick notes here as they come up.)
