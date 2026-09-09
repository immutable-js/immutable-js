# immutable-js – Agent Guide

## Repository overview

immutable-js provides persistent, immutable data collections for JavaScript
(List, Map, Set, OrderedMap, OrderedSet, Stack, Record, Range, Repeat, Seq…).
The public API surface lives in `src/` and the type definitions are generated
from source (the goal is to eventually delete `type-definitions/immutable.d.ts`
entirely and let TypeScript infer everything from the `.ts` sources).

---

## Branch strategy

| Branch  | Purpose |
|---------|---------|
| `6.x`   | **Active development** – all new features and the TS migration live here |
| `main`  | **Bug-fixes only** – backports from `6.x` when needed |

**Always develop on `6.x` unless the task is explicitly a bug-fix that must
land on `main`.**

---

## Goals for v6

1. **Full TypeScript migration** – every `.js` file in `src/` must become
   `.ts`. Types should be derived from the source, not from
   `type-definitions/immutable.d.ts`.
2. **Delete `type-definitions/immutable.d.ts`** – once the TS migration is
   complete, types will be emitted by the TypeScript compiler directly.
3. **Modern codebase** – the build target is `"last 2 versions, not dead"` via
   Babel. IE ≤ 12, Safari ≤ 8 and other legacy browsers are no longer
   supported.

### Breaking changes already shipped in 6.x

- **Modern JS output** (babel replaces buble; ES2022 class syntax in dist).
- **`instanceof` no longer works** on factory functions (`Map()`, `List()`,
  etc.). Use `Map.isMap()`, `List.isList()`, etc. instead.
- **Empty collections are no longer singletons** (`Map() !== Map()`).
- **TypeScript < 5.0 dropped** (uses `const` type parameters for `getIn`).
- **transducers-js compatibility removed.**

---

## TypeScript migration status

### Already migrated to `.ts`

| File | Notes |
|------|-------|
| `src/Collection.ts` | Core collection class, partially done |
| `src/CollectionHelperMethods.ts` | Mixin helper methods |
| `src/Hash.ts` | |
| `src/Iterator.ts` | |
| `src/Math.ts` | |
| `src/PairSorting.ts` | |
| `src/Range.ts` | |
| `src/TrieUtils.ts` | |
| `src/ValueObject.ts` | |
| `src/is.ts` | |
| `src/toJS.ts` | |
| `src/predicates/*.ts` | All predicate files are already TS |
| `src/utils/*.ts` | All utility files are already TS |
| `src/functional/*.ts` | Most functional helpers are TS (except `merge.js`) |

### Still in JavaScript – to migrate

| File | Complexity |
|------|------------|
| `src/Immutable.js` | Entry point – low complexity, just re-exports |
| `src/CollectionImpl.js` | Core collection implementation |
| `src/Seq.js` | Lazy sequences |
| `src/List.js` | Large, complex (HAMT trie) |
| `src/Map.js` | Large, complex (HAMT trie) |
| `src/OrderedMap.js` | |
| `src/OrderedSet.js` | |
| `src/Record.js` | |
| `src/Repeat.js` | |
| `src/Set.js` | |
| `src/Stack.js` | |
| `src/fromJS.js` | |
| `src/functional/merge.js` | |
| `src/methods/*.js` | All method files in this directory |

---

## Development commands

```bash
# Run the full test suite (format + lint + type-check + build + unit + type tests)
npm test

# Run only unit tests (fast, no build required)
npm run test:unit

# Run only type tests (tstyche)
npm run test:types

# Type-check without running tests
npm run type-check

# Format code (auto-fix)
npm run format

# Lint (check only)
npm run lint

# Build the dist/ directory
npm run build
```

> In local development `npm run test:unit` resolves `import 'immutable'`
> directly to `src/Immutable.js` (see `resources/jestResolver.js`). On CI it
> uses the built `dist/immutable.js` instead. Always run `npm run build`
> before running the full `npm test`.

---

## Project structure

```
src/                  Source files (mix of .js and .ts during migration)
  predicates/         isMap, isList, … – all already TS
  utils/              Internal helpers – all already TS
  functional/         Standalone functional helpers – mostly TS
  methods/            Mixin methods shared across collections – still JS
__tests__/            Jest test files (TypeScript)
type-definitions/
  immutable.d.ts      Hand-written type declarations (to be deleted once migration is complete)
  ts-tests/           TSTyche type-level tests
  flow-tests/         Flow type tests (legacy)
resources/            Build scripts, rollup config, jest preprocessor
website/              Next.js documentation site
dist/                 Build output (not committed)
```

---

## Code conventions

### TypeScript

- **Strict mode** is enabled (`"strict": true`, `noUncheckedIndexedAccess`,
  `noImplicitOverride`).
- Target: `es2022`, module: `ESNext`, `verbatimModuleSyntax: true`.
- Use `import type` for type-only imports.
- No `any` – prefer proper types or `unknown`.

### Formatting

- **Prettier**: `singleQuote: true`, `trailingComma: 'es5'`.
- **EditorConfig**: 2-space indent, LF line endings, UTF-8.
- Run `npm run format` to auto-fix before committing.

### ESLint

- `eqeqeq` enforced (no `==`).
- `no-var` enforced – use `const`/`let`.
- `prefer-arrow-callback` enforced.
- `no-console` in `src/*`.
- Imports must be ordered alphabetically (`import/order`).

### General style

- Factory functions, not class constructors for public API (do not add `new`
  to public-facing factories).
- Internal implementation classes are named `*Impl` (e.g. `CollectionImpl`,
  `ListImpl`) and are not exported.
- No backwards-compatibility shims – remove code cleanly when migrating.
- No comments explaining *what* the code does; only add a comment when the
  *why* is non-obvious.

---

## When migrating a file from JS to TS

Follow the step-by-step guide in [`.agents/commands/migrate-to-ts.md`](.agents/commands/migrate-to-ts.md).

---

## Build system

- **Rollup** (`resources/rollup-config.mjs`) bundles the library into:
  - `dist/immutable.js` (UMD)
  - `dist/immutable.min.js` (UMD minified)
  - `dist/immutable.mjs` (ES module)
- **Babel** (`babel.config.cjs`) transpiles TS and modern JS via
  `@babel/preset-env` (targets: `last 2 versions, not dead`) and
  `@babel/preset-typescript`.
- **Jest** uses `resources/jestPreprocessor.js`: TS files are transpiled by
  the TypeScript compiler directly; JS files go through Babel via rollup.

---

## Pull requests

- Target branch: **`6.x`** (unless it is a bug-fix that must land on `main`).
- Keep commits focused – one logical change per commit.
- Update `CHANGELOG.md` under the `## Unreleased` section for user-visible changes.
- Type tests in `type-definitions/ts-tests/` must be updated when public
  types change. If a migrated file introduces or refines public types that
  are not yet covered by a type test, add the missing tests.
