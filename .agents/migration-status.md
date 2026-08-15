# TypeScript migration — status report

> Snapshot last updated on the `operations/aggregations.js` migration branch (stacked on the `To*`/`concat` relocation, itself a follow-up to PR #2215), 2026-08-09. Update this file as migration PRs land.

## Where the migration stands

### Migrated to TypeScript

| File                                                                                                                                                        | Notes                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/Collection.ts`                                                                                                                                         | Classes + most shared methods (PRs #2192, #2215); placeholders overwritten at runtime by `operations/sequences.ts`                |
| `src/CollectionHelperMethods.ts`                                                                                                                            |                                                                                                                                   |
| `src/Seq.ts`                                                                                                                                                | Includes the `*SeqImpl` classes and factories                                                                                     |
| `src/Range.ts`, `src/Hash.ts`, `src/Iterator.ts`, `src/Math.ts`, `src/PairSorting.ts`, `src/TrieUtils.ts`, `src/ValueObject.ts`, `src/is.ts`, `src/toJS.ts` |                                                                                                                                   |
| `src/operations/factories.ts`                                                                                                                               | PR #2194 split, typed with the `MutableSequence` scaffolding (see TODO inventory)                                                 |
| `src/operations/helpers.ts`                                                                                                                                 | PR #2206                                                                                                                          |
| `src/operations/aggregations.ts`                                                                                                                            | Also installs `countBy`/`groupBy` on the collection prototype; `Map` types still come from the d.ts until `Map.js` is migrated    |
| `src/operations/sequences.ts`                                                                                                                               | PR #2215; also installs `toIndexedSeq`/`toKeyedSeq`/`toSetSeq`/`fromEntrySeq`/`concat` on the collection prototypes (this branch) |
| `src/predicates/*.ts`                                                                                                                                       | All                                                                                                                               |
| `src/utils/*.ts`                                                                                                                                            | All                                                                                                                               |
| `src/functional/*.ts`                                                                                                                                       | All except `merge.js`                                                                                                             |

### Still JavaScript (26 files)

| File                          | Notes / suggested order                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/fromJS.js`               | Standalone; low coupling                                                                                |
| `src/methods/*.js` (14 files) | Mixin methods shared by the concrete collections; several are one-liners (`asImmutable`, `wasAltered`…) |
| `src/functional/merge.js`     | Depends on `Map`/collection factories                                                                   |
| `src/Repeat.js`               | Small leaf (see the covariant-`this` guide section for `slice`)                                         |
| `src/Stack.js`                | Medium                                                                                                  |
| `src/OrderedSet.js`           | Small, but copies `zip*` from `IndexedCollectionPrototype`                                              |
| `src/Set.js`                  | Medium                                                                                                  |
| `src/OrderedMap.js`           | Depends on Map + List                                                                                   |
| `src/List.js`                 | Large (VList trie)                                                                                      |
| `src/Map.js`                  | Large (HAMT trie)                                                                                       |
| `src/Record.js`               | Copies methods from `CollectionPrototype` and `src/methods/*`                                           |
| `src/CollectionImpl.js`       | Shrinking mixin — see below                                                                             |
| `src/Immutable.js`            | Entry point; migrate last (re-exports only)                                                             |

### `CollectionImpl.js` mixin dismantling

Done:

- “Group A” methods moved onto the `Collection.ts` classes (PR #2192).
- Order-safe methods (`toArray`, `toJSON`, `entrySeq`, `mapEntries`, `mapKeys`, `Set#has`…) moved onto the classes (PR #2215).
- `toIndexedSeq`, `toKeyedSeq` (both variants), `toSetSeq`, `fromEntrySeq` and `concat` installed on the prototypes from `operations/sequences.ts` (this branch). `CollectionImpl.js` now only side-effect-imports that module.
- `concat` fully typed per the d.ts: base method on `CollectionImpl`, `declare` narrowings on the `*CollectionImpl` kind classes (matching the existing `*SeqImpl` ones), and a `SeqImpl`-level method for the `Seq` contract (this branch).
- `countBy` / `groupBy` installed on the prototype from `operations/aggregations.ts` (migrated to TS in the same move), mirroring the sequences.ts pattern.

Still in the mixin:

- Late-binding conversions (circular-dependency escape hatch): `toMap`, `toOrderedMap`, `toOrderedSet`, `toSet`, `toStack`, `toList`.
- `IndexedCollectionImpl`: `splice`, `keySeq`.
- The `chain` → `flatMap` legacy alias (must stay reference-equal).
- `Collection.Iterator = Iterator` static assignment.

## Cast inventory

The 51 documented casts are split by _who can remove them_ (see the tagging
rule in `.agents/commands/migrate-to-ts.md`). Only the first table shrinks as
files get migrated.

### `TODO [TS-MIGRATION]` — lifted by the migration (7)

| Theme                                                                  | Count | Where                              |
| ---------------------------------------------------------------------- | ----- | ---------------------------------- |
| Record still typed via the d.ts (`src/Record.js`)                      | 4     | `Seq.ts`, `functional/updateIn.ts` |
| `Map` runtime factory still untyped JS (boundary annotations)          | 1     | `operations/aggregations.ts`       |
| d.ts convergence: `fromEntrySeq` entry types, keyed narrowing of `map` | 2     | `Collection.ts`                    |

### `TODO [TS-DESIGN]` — needs a refactor unrelated to the migration (39)

| Theme                                                                                                      | Count | Where                                                |
| ---------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------- |
| `MutableSequence` build-by-mutation scaffolding (interface, dynamic-build boundaries, loose builder casts) | ~30   | `operations/factories.ts`                            |
| unknown-key/value bridges (`get`/`has` receive `unknown` from loosely-typed seqs)                          | ~5    | `operations/factories.ts`                            |
| `cacheResult`/`cacheResultThrough` typing (`this`-returning cache hooks)                                   | 3     | `operations/factories.ts`, `operations/sequences.ts` |
| Lazy-materialization internals (`_cache`, `__iterateUncached`…) declared on the base                       | 1     | `Collection.ts`                                      |

All of `operations/factories.ts` collapses into one decision: turning the
factory-built seqs into real classes.

### Untagged — irreducible runtime invariants (5)

Documented in place, no `TODO`: the group kind in `operations/aggregations.ts`,
the `_useKeys` indexed-only shortcuts and the keyed-`concat` member type in
`operations/sequences.ts`, the `entrySeq`/`fromEntrySeq` round-trip in
`Collection.ts`.

## Source-pass type tests (`type-definitions/ts-tests-src/`)

196 `test.skip` remaining. The goal is to keep this number strictly decreasing: the source's public types must converge on `immutable.d.ts` (which will eventually be generated from the source — see the note in `.agents/commands/migrate-to-ts.md` step 5). Biggest blockers are simply the not-yet-migrated public factories/types:

| File                                                           | Skips   | Blocked by                                                                                                                      |
| -------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `list.ts`                                                      | 34      | `List` migration                                                                                                                |
| `map.ts`                                                       | 32      | `Map` migration                                                                                                                 |
| `ordered-map.ts`                                               | 27      | `OrderedMap` migration                                                                                                          |
| `set.ts`                                                       | 22      | `Set` migration                                                                                                                 |
| `ordered-set.ts`                                               | 18      | `OrderedSet` migration                                                                                                          |
| `stack.ts`                                                     | 17      | `Stack` migration                                                                                                               |
| `collection.ts`                                                | 13      | Concrete public types (`List<number>` as a type, …)                                                                             |
| `deepCopy.ts` / `covariance.ts` / `record.ts` / `partition.ts` | 7/6/5/5 | `DeepCopy` (d.ts-only), concrete types, `Record` migration                                                                      |
| others                                                         | ≤2 each | `fromJS` + `MapOf` (d.ts-only), exports (needs ~everything), ES6 collections (`Map`/`Set`), `groupBy` (returns `Map`), `Repeat` |

`empty.ts`, `range.ts` and `seq.ts` are fully un-skipped; the other active tests are concentrated in `partition.ts` and `functional.ts`.

## JS → TS consistency review (behavioural check)

Each migrated file was compared function-by-function against its last JavaScript version (`Seq.js`, `Operations.js`, the `CollectionImpl.js` mixin before PRs #2192/#2215, and the pre-migration `.js` utility files from v5.0.3). Method inventory is complete — nothing was lost in the moves, and the three reference-equality aliases pinned by tests (`Symbol.iterator === values`, keyed `[Symbol.iterator] === entries`, `SetCollection.keys === values`) are preserved. Findings below are **recorded, not fixed** — each deserves its own small PR (or an explicit "intended, document it" decision).

### Likely bugs / decisions needed

| #   | Where                                                                                         | Issue                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `src/Collection.ts` (`isSubset` + `hasIncludesMethod`)                                        | The new `typeof iter === 'object'` guard excludes strings: `isSubset('abc')` used to hit `String.prototype.includes` (substring semantics), it now iterates characters via `Collection('abc')`. Result changes for multi-char values, e.g. `Set(['ab']).isSubset('abc')`: `true` → `false`. The added unit test only uses single-char values so it cannot catch this. Decide + document, or restore the old duck-typing.          |
| R2  | `src/Iterator.ts`                                                                             | The `'@@iterator'` (`FAUX_ITERATOR_SYMBOL`) fallback was dropped entirely, both when installing iterators and when _reading_ them (`hasIterator`/`getIteratorFn`): `Seq({'@@iterator': fn})` now takes the plain-object path. Probably intended modernisation, but `immutable.d.ts` (§"or @@iterator") and `immutable.js.flow` still promise it — either restore read-side support or document the break (d.ts, flow, CHANGELOG). |
| R3  | `src/operations/factories.ts` (`reverseFactory`, the two `(… .size ?? 0) - ++i`)              | For a lazy seq of unknown size, reversed indexed iteration used to produce `NaN` keys; `?? 0` turns them into `-1, -2, …`. Both are wrong — the real fix is to `ensureSize` the _reversed sequence_ (the existing `ensureSize(collection)` guard fixes the wrong object's size).                                                                                                                                                  |
| R4  | `src/TrieUtils.ts` (`wholeSlice`, `(begin ?? 0) <= -size`)                                    | With `begin === undefined` the old NaN-comparison was always `false`; the new `0 <= -size` is `true` for `size === 0`, so `slice()` on an empty collection now short-circuits to `this` instead of going through `sliceFactory`. Values are equivalent; returned-object identity changes. Faithful form: `begin !== undefined && begin <= -size`.                                                                                 |
| R5  | `src/operations/factories.ts` (`sortFactory`/`maxFactory`, `comparator ?? defaultComparator`) | `sort(null)` / `max(null)` used to fall back to the default comparator (`if (!comparator)`), they now throw. Inconsistent with `min`/`minBy` in Collection.ts which kept the truthiness check.                                                                                                                                                                                                                                    |
| R6  | `src/utils/hasCollection.ts`                                                                  | Dead duplicate of `hashCollection.ts` (typo'd name, stale body: misses the `size ?? 0`). Never imported, so never type-checked (`tsconfig.src.json` only walks the graph from `src/Immutable.js`). Delete it.                                                                                                                                                                                                                     |

### Latent risks (no active bug — audited)

- `src/Collection.ts` — `size: number | undefined = 0` is a real initialized class field; any future subclass whose constructor forgets to assign `size` gets `0` instead of the `undefined` that `ensureSize`/`wholeSlice`/ `resolveIndex` are designed around. Every current subclass assigns it (audited), and `makeSequence` bypasses constructors. `declare size` would be safer.
- `src/utils/arrCopy.ts` — now `arr.slice(offset)`: negative offsets, array-likes and sparse-array densification silently changed contract. All four current call sites are safe (real arrays, no offset), including the sparse `HashArrayMapNode` arrays from `Map.js`, which only use index-reads/`length`.
- `src/utils/mixin.ts` — `getOwnPropertyNames` + `methods[key]` would invoke getters if a class prototype with accessors is ever passed; both current call sites are plain object literals.
- `src/Collection.ts` `toSeq()` — the old dynamic kind-dispatch became static per class. Correct for every current subclass (audited, including `ConcatSeq` whose brands are instance-level but which inherits `SeqImpl.toSeq() { return this }`), but a future direct `CollectionImpl` subclass branded indexed/set would silently get a keyed seq.
- Reference-equality aliases not pinned by tests were converted to separate methods (`toJSON`→`toArray`/`toObject`, `contains`→`includes`, `inspect`/`toSource`…). Return values are identical; one nuance: keyed `toJSON` now calls `this.toObject()`, so overriding `toObject` in a subclass now also changes `toJSON` (no such override exists today).

### Intentional behaviour changes worth a CHANGELOG entry

- `RangeImpl.equals`: `other instanceof Range` threw at runtime since `Range` became an arrow factory (arrow functions have no `.prototype`) — the TS version (`instanceof RangeImpl`) **fixes** `Range(...).equals(...)`.
- Empty-singleton removal: `Range(0, 0) !== Range(0, 0)`, and `Range(0, 0).equals(Range(5, 5))` is now `false` (was `true` via the shared `EMPTY_RANGE`).
- `IndexedCollectionImpl.has` on a lazy seq of unknown size now checks index existence instead of value-equal-to-index search (commit `e8eea1c`).
- `isSuperset` no longer delegates to a duck-typed `iter.isSubset`; `isSubset(null)` / `isSuperset(null)` return a boolean instead of throwing.
- Proto-key guards (pre-existing upstream, not migration artifacts): the `isProtoKey` check also blocks `'constructor'` (silent key loss in `toJS`/`set`), and in `functional/set.ts` it runs _before_ `isDataStructure`, so `set(42, '__proto__', v)` no longer throws.

## Suggested next steps

1. **`src/methods/*.js`** — mostly mechanical; unblocks `Record.js` and the concrete collections.
2. **Leaf collections** (`Repeat`, `Stack`, `Set`, `OrderedSet`), then `Map`/`OrderedMap`/`List`, then `Record`.
3. **`fromJS.js`, `functional/merge.js`, `Immutable.js`**, then flip `ts-tests/tsconfig.json` to the source and delete `type-definitions/immutable.d.ts` (see `.agents/commands/migrate-to-ts.md` step 8).
