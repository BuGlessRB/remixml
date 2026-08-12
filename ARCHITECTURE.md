# ARCHITECTURE.md

## Overview

Remixml is a two-stage template engine: a compiler turns a Remixml/XML/XHTML
source template into plain JavaScript, and the resulting function is a runner
that produces a DOM-abstract tree from a data context.  Serialisers render that
tree as text or as live DOM nodes.  Everything runs in modern browsers and
NodeJS, has zero runtime dependencies, and ships a sub-7 KB gzipped runtime
which includes the compiler.

The single source of truth is `remixml.master.js`; all distribution artefacts
are generated from it (see Build workflow).

## Processing pipeline

1. **Compilation.**  The compiler parses the template in one pass and emits a
   JavaScript function literal, embedding static content directly and turning
   each language construct (entities, tags, expressions) into generated code
   that calls runtime helpers.  A peephole pass collapses trivial assignments
   into plain assignments.  A single flag switches the whole pipeline between
   synchronous and asynchronous (Promise-returning) output.
2. **Loading.**  The generated source is evaluated into a callable template
   function.  Syntax failures are trapped and reported rather than thrown, so
   a broken template degrades gracefully instead of crashing the page.
3. **Rendering.**  Running the function with a context produces a
   DOM-abstract tree.  Rendering is a pure function of the context; cached
   sub-trees are cloned on use so that outputs never alias shared state.
4. **Serialising.**  The DOM-abstract is converted to an XHTML/HTML string, or
   to DOM nodes through one of the optional `remixml-*dom` modules.

## Generated code contract

The compiler emits a self-contained function of the context: static content is
embedded directly, entities become guarded insertions, and tags become inlined
control flow that calls runtime helpers; a single flag switches the emitted
code between synchronous and asynchronous form.

The generated source is an internal intermediate representation and is
**not a contract**.  The exact generated text, variable naming, helper-call
patterns and minification change without notice between versions, so:
precompiled templates (compiled in one environment and shipped as JavaScript)
must be regenerated with the same engine version they run against; generated
code is never a review or hand-edit target; and runtime error messages may
quote generated expressions for diagnostic purposes.

The stable interfaces are the public API (compilation, loading and rendering
entry points), the DOM-abstract output and the text serialisation.

## The DOM-abstract model

The DOM-abstract is the universal interchange format shared by the runner, the
cache and every serialiser.  It is a tagged-array tree: each node is an array
whose tag property identifies the node kind, with child nodes and attribute
values as payload.  Plain strings represent text.  Because every stage
operates on the same representation, compiled templates can be cached,
combined and re-rendered without re-parsing.

## Runtime subsystems

- **Context management.**  A context object holds named scopes; the local
  scope is always available.  Nested constructs create derived contexts,
  giving lexical scoping: variable assignments in a child scope do not leak
  into the parent, and custom tag definitions are scoped the same way.
- **Node construction.**  Helpers build and populate tagged-array nodes and
  apply attributes, including attribute spreading.
- **Variable evaluation.**  Entity and expression evaluation resolves dotted
  paths against the context, applies the requested encoding (auto-escaping,
  URI or JSON encoding, recursion) and formatting, and safely yields an empty
  result for undefined paths.
- **Insertion and tree transforms.**  A central insertion routine appends
  values into a node, cloning abstract sub-trees when needed.  Tree-walking
  transforms implement tag washing, whitespace trimming and substring
  operations over the hierarchy.
- **Iteration.**  The loop construct iterates arrays, objects and counted
  ranges, with optional ordering, and exposes per-iteration metadata through
  the local scope.
- **Caching.**  An abstract cache stores rendered sub-trees keyed by cache
  context and dependencies, with a time-to-live and a bounded entry count.
  Cache contexts can be shared explicitly; sections inside a cache can be
  marked uncached and are re-evaluated per render.
- **Error trapping.**  All errors originating inside templates — including
  embedded JavaScript — are trapped and routed to a settable logging callback
  (defaulting to `console.error`), and parsing continues forgivingly.  This
  shields application pages from fatal template errors.

## Extension points

- **Custom tags** can be declared in template source or registered from
  JavaScript; they support named arguments, default argument lists and
  recursion.
- **Filters** extend the entity encoding vocabulary.
- **Formatting** (printf/currency/date) is supplied by the optional
  `remixml-fmt` module.
- **Environment modules** (`remixml-dom`, `remixml-htmldom`, `remixml-idom`,
  `remixml-jsobj`, `remixml-embed`, `remixml-pathencode`) plug in DOM output
  and environment-specific behaviour without enlarging the core.

## Environments and delivery

- Runs in any browser or NodeJS environment supporting ES2018 or newer.
- Host features are detected via `typeof` guards, never assumed: the same core
  loads as an AMD module, a CommonJS module or a browser global.
- The core must stay free of Node-only globals and of post-ES2018 syntax in
  shipped code; the compiler's output target enforces this floor.
- The package declares zero runtime dependencies and `sideEffects: false`.

## Build workflow

`remixml.master.js` is the only hand-maintained source file.  The build
(`prepfiles`) extracts marked regions (externs and prepended runtime
declarations), strips development-only sections, and runs the Closure Compiler
in advanced mode to produce the minified distribution; the unminified
distribution is derived from the same master.  Development switches (`DEBUG`
and friends) are compiled to their production values so the shipped runtime
excludes diagnostic overhead.

## Testing workflow

The regression testsuite (`testsuite/`) holds template/data/expected-output
triplets.  The test driver (`runtest.sh`) compiles each template both
synchronously and asynchronously, renders it against its data, verifies the
outputs match each other and the expected result, and times the renders.  The
same suite exercises the unminified and minified builds.

## Design patterns

- **Compile-time code generation with peephole optimisation.**  Templates are
  translated to generated JavaScript strings; simple assignments are
  collapsed at generation time to avoid runtime indirection.
- **One representation, many consumers.**  The DOM-abstract is shared by the
  runner, the cache and all serialisers, keeping the core small and the
  stages decoupled.
- **Immutable-by-copy rendering.**  Derived contexts and cloned cache results
  prevent cross-render aliasing and keep caching safe.
- **Forgiving failure.**  Errors are trapped, logged and recovered from at
  every stage (parse, compile, render) instead of being allowed to crash the
  host page.
- **Hot-path discipline.**  The generated runner and its helpers are written
  for V8-style optimising engines: fixed-shape objects, packed arrays,
  constant-key property access and an LRU/TTL cache backed by a `Map`.

## Historical note

Remixml descends from RXML, the Roxen webserver macro language, and has been
through several major rewrites; the version history is recorded in
`CHANGELOG.md`.
