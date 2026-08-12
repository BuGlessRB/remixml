# CONVENTIONS.md

## Core Output & Tone
* Minimal explanatory prose. Lead directly with diffs or code.
* NEVER add inline comments explaining code changes.
* NEVER update, reformat, or delete existing comments unless explicitly commanded.
* Only for the CONVENTIONS.md file:
  * All bullet points must be exactly one physical line without visible line breaks within.
  * Rules must be written generically and computer-language-indifferently, avoiding concrete examples unless required for unambiguous formulation.

## Project (Remixml)
* Pure JavaScript only: no TypeScript, no transpilation to or from other languages, no build-time type checking.
* Must run in modern browsers: no Node.js-only globals (`process`, `Buffer`, `fs`, runtime `require`), no host APIs accessed without a `typeof` feature guard.
* Zero runtime dependencies: keep `dependencies` in `package.json` empty and `sideEffects` false.
* Source of truth is `remixml.master.js`; regenerate `remixml.js` and `remixml.min.js` with `./prepfiles` (Closure Compiler, ECMASCRIPT_2018 output) after any master change.
* Shipped code must stay within ES2018: newer syntax such as `??` or `?.` is allowed only if the Closure output target guarantees downleveling.
* Type with inline Closure-style JSDoc annotations (`/** string */`, `/** !Object */`, `/** number= */`, `/** function(!Object):!Array */`).
* Wrap all shipped code in strict mode (`"use strict"`).

## Documentation (ARCHITECTURE.md)
* Architectural scope only: design patterns, workflows, module responsibilities.
* FORBIDDEN: Low-level implementation details, internal variables, function signatures.

## Version Control (Git Commits)
* Commit granularity is by logical concern: keep all interdependent changes (e.g. a refactoring and every edit it necessitates) in one commit.
* Keep unrelated concerns in independent commits: never bundle independent changes into the same commit.

## Workflow & Deliverables
* Prioritise high-impact improvements; produce precise, minimal diffs.
* Apply refactoring with tight, localised edits that preserve existing behaviour.
* Ensure new or refactored functions are cleanly typed and documented where appropriate.
* Update ARCHITECTURE.md when a change alters architectural scope.
* Run Full Verification after all edits; do not conclude until it passes.
* Full Verification for this project is `npm test` (runs `./prepfiles` then `./runtest.sh` against the testsuite).

## Reliability & Resource Management
* Prevent race conditions, deadlocks, memory leaks, and file descriptor leaks.
* Guarantee explicit clean-up and closure of handles, streams, and file descriptors.
* Guard against unhandled or rare edge-case exceptions to prevent application crashes.
* FORBIDDEN: Loops whose cost scales with uncontrollable external factors (user or configuration input).
* If logic dictates that certain errors only happen when other specific errors already preceded them, then the current error is best ignored and not reported separately.

## Code Style & Formatting
* **DRY:**
  * Extract identical or structural code duplication into clear, reusable abstractions and helper functions.
  * Hoist loop invariants outside the loop.
  * Define constants for most numbers in the code unless they are invariant because of code constraints.
* **Indentation & Line Limits:**
  * Preserve surrounding space/tab indentation and line-breaks exactly.
  * Hard limit: 80 columns. Exception: CONVENTIONS.md file.
* **Control Flow & Braces:**
  * A body that is a single statement MUST be placed on the next line, not on the same line as the control keyword.
  * Join consecutive condition paths with `&&`. FORBIDDEN: Splitting compound conditions into nested `if` blocks unless required for variable scoping or complex branching logic.
  * Omit `{}` for single‑statement bodies that are on the next line and consist of exactly one physical line.
  * Empty bodies: inline `{}` on header line (e.g., `for (;;) {}`, `catch {}`). FORBIDDEN: empty `;` or multi-line empty bodies.
  * Prefer `switch()` over multiple `if`/`else if` statements checking an identical variable.
  * FORBIDDEN: Nested `try...catch` blocks.
* **Conditional Expressions & Parentheses:**
  * Prefer non‑negated conditions. Invert `if`‑`else` branches to avoid leading `!` or `!==`.
  * Use De Morgan’s laws or boolean transforms to eliminate unnecessary negations.
  * Assume precise operator precedence; omit redundant grouping parentheses.
* **Functions & Variables:**
  * Prefer concise arrow functions (`x => expr`). Explicit block for `undefined` return: `x => { expr; }`.
  * Prefer `x => {}` for no-ops.
  * FORBIDDEN: Single-use helper variables or helper functions. Exception: hoisted loop invariants.
  * FORBIDDEN: `async` keyword when returning a Promise directly.
  * Template literals: Simple variable/property access only (`${var}`, `${obj.prop}`). No inline expressions.
* **Quoting:**
  * Prefer double quotes for string literals.
  * Use single quotes only when it reduces the amount of quoting needed.

## Language & Logging
* British English mandatory (comments, logs, identifiers).
* Terminal period (`.`) required on all comment sentences.

## V8 Performance & Types
* Hidden Classes: Initialize object properties at instantiation in a fixed order. Assign `undefined` instead of using `delete`.
* Homogeneous arrays only (`number[]`, `object[]`). FORBIDDEN: Sparse/holey arrays.
* Hot Paths: Explicit property access only (`obj.prop`). FORBIDDEN: Dynamic key lookups (`obj[key]`). Exception: `Map.get` is allowed.

## Visual Comment Staircase (Legacy Format)
* **Preservation:** NEVER reformat, shift, or recalculate existing comment staircases unless explicitly commanded to rewrite them.
* **Applicability:** Applies only to multiline `//` comment blocks of 4 lines or fewer. Skip conversion if block > 4 lines or uses `/* */`.
* **Layout Geometry:**
  * **Anchor Line (Bottom comment line):** Leading indentation MUST match the column index of the target code line directly below it.
  * **Preceding Lines (Lines above):** Each line `N-1` is indented strictly 1 space **further right** than line `N`.
  * **Text Alignment:** Comment text across all staircase lines MUST align vertically to start at the exact same column position.
  * **Gap Limit:** Maximum 2 non-comment lines between connected staircase lines.
