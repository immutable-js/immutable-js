# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Dates are formatted as YYYY-MM-DD.

## Unreleased

## [4.3.2] - 2023-08-01

- Fix isOrderedSet type [#1948](https://github.com/immutable-js/immutable-js/pull/1948)

## [4.3.1] - 2023-07-11

- Faster and implementation of `some` [#1944](https://github.com/immutable-js/immutable-js/pull/1944)
- [internal] remove unused exports [#1928](https://github.com/immutable-js/immutable-js/pull/1928)

## [4.3.0] - 2023-03-10

- Introduce Comparator and PairSorting [#1937](https://github.com/immutable-js/immutable-js/pull/1937) by [@https://github.com/giancosta86](https://github.com/giancosta86)
- Fix fromJS declaration for greater compatibility [#1936](https://github.com/immutable-js/immutable-js/pull/1936)

## [4.2.4] - 2023-02-06

- Improve type infererence for from JS by [KSXGitHub](https://github.com/KSXGitHub) [#1927](https://github.com/immutable-js/immutable-js/pull/1927)

## [4.2.3] - 2023-02-02

- TypeScript: `groupBy` return either a `Map` or an `OrderedMap`: make the type more precise than base `Collection` [#1924](https://github.com/immutable-js/immutable-js/pull/1924)

## [4.2.2] - 2023-01-02

- [Flow] Add type for `partition` method [#1920](https://github.com/immutable-js/immutable-js/pull/1920) by [Dagur](https://github.com/Dagur)

## [4.2.1] - 2022-12-23

- [Typescript] rollback some of the change on `toJS` to avoir circular reference

## [4.2.0] - 2022-12-22

- [TypeScript] Better type for toJS [#1917](https://github.com/immutable-js/immutable-js/pull/1917) by [jdeniau](https://github.com/jdeniau)
  - [TS Minor Break] tests are ran with TS > 4.5 only. It was tested with TS > 2.1 previously, but we want to level up TS types with recent features. TS 4.5 has been released more than one year before this release. If it does break your implementation (it might not), you should probably consider upgrading to the latest TS version.
- Added a `partition` method to all containers [#1916](https://github.com/immutable-js/immutable-js/pull/1916) by [johnw42](https://github.com/johnw42)

## [4.1.0] - 2022-05-23

- Accept Symbol as Map key. [#1859](https://github.com/immutable-js/immutable-js/pull/1859) by [jdeniau](https://github.com/jdeniau)
- Optimize contructors without arguments [#1887](https://github.com/immutable-js/immutable-js/pull/1887) by [marianoguerra](https://github.com/marianoguerra)
- Fix Flow removeIn types [#1902](https://github.com/immutable-js/immutable-js/pull/1902) by [nifgraup](https://github.com/nifgraup)
- Fix bug in Record.equals when comparing against Map [#1903](https://github.com/immutable-js/immutable-js/pull/1903) by [jmtoung](https://github.com/jmtoung)

## [4.0.0] - 2021-09-30

This release brings new functionality and many fixes.

1. [Key changes](#key-changes)
1. [Note for users of v4.0.0-rc.12](#note-for-users-of-v400-rc12)
1. [Breaking changes](#breaking)
1. [New](#new)
1. [Fixed](#fixed)

### Key changes

- New members have joined the team
- The project has been relicensed as MIT
- Better TypeScript and Flow type definitions
- A brand-new documentation lives at [immutable-js.com](https://immutable-js.com/) and can show multiple versions
- Behavior of `merge` and `mergeDeep` has changed
- `Iterable` is renamed to [Collection](https://immutable-js.com/docs/latest@main/Collection/)
- [Records](https://immutable-js.com/docs/latest@main/Record/) no longer extend from Collections
- All collection types now implement the [ES6 iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)
- New methods:
  - [toJSON()](<https://immutable-js.com/docs/latest@main/Collection/#toJSON()>)
  - [wasAltered()](<https://immutable-js.com/docs/latest@main/Map/#wasAltered()>)
  - [Collection.Indexed.zipAll()](<https://immutable-js.com/docs/latest@main/Collection.Indexed#zipAll()>)
  - [Map.deleteAll()](<https://immutable-js.com/docs/latest@main/Map/#deleteAll()>)

<details><summary>&nbsp;&nbsp; Diff of changed API (click to expand)</summary>

```diff
+  Collection.[Symbol.iterator]
+  Collection.toJSON
+  Collection.update
+  Collection.Indexed.[Symbol.iterator]
+  Collection.Indexed.toJSON
+  Collection.Indexed.update
+  Collection.Indexed.zipAll
+  Collection.Keyed.[Symbol.iterator]
+  Collection.Keyed.toJSON
+  Collection.Keyed.update
+  Collection.Set.[Symbol.iterator]
+  Collection.Set.toJSON
+  Collection.Set.update
-  Collection.size
-  Collection.Indexed.size
-  Collection.Keyed.size
-  Collection.Set.size

+  List.[Symbol.iterator]
+  List.toJSON
+  List.wasAltered
+  List.zipAll
-  List.mergeDeep
-  List.mergeDeepWith
-  List.mergeWith

+  Map.[Symbol.iterator]
+  Map.deleteAll
+  Map.toJSON
+  Map.wasAltered

+  OrderedMap.[Symbol.iterator]
+  OrderedMap.deleteAll
+  OrderedMap.toJSON
+  OrderedMap.wasAltered
+  OrderedSet.[Symbol.iterator]
+  OrderedSet.toJSON
+  OrderedSet.update
+  OrderedSet.wasAltered
+  OrderedSet.zip
+  OrderedSet.zipAll
+  OrderedSet.zipWith

+  Record.[Symbol.iterator]
+  Record.asImmutable
+  Record.asMutable
+  Record.clear
+  Record.delete
+  Record.deleteIn
+  Record.merge
+  Record.mergeDeep
+  Record.mergeDeepIn
+  Record.mergeDeepWith
+  Record.mergeIn
+  Record.mergeWith
+  Record.set
+  Record.setIn
+  Record.toJSON
+  Record.update
+  Record.updateIn
+  Record.wasAltered
+  Record.withMutations
+  Record.Factory.displayName
-  Record.butLast
-  Record.concat
-  Record.count
-  Record.countBy
-  Record.entries
-  Record.entrySeq
-  Record.every
-  Record.filter
-  Record.filterNot
-  Record.find
-  Record.findEntry
-  Record.findKey
-  Record.findLast
-  Record.findLastEntry
-  Record.findLastKey
-  Record.first
-  Record.flatMap
-  Record.flatten
-  Record.flip
-  Record.forEach
-  Record.groupBy
-  Record.includes
-  Record.isEmpty
-  Record.isSubset
-  Record.isSuperset
-  Record.join
-  Record.keyOf
-  Record.keySeq
-  Record.keys
-  Record.last
-  Record.lastKeyOf
-  Record.map
-  Record.mapEntries
-  Record.mapKeys
-  Record.max
-  Record.maxBy
-  Record.min
-  Record.minBy
-  Record.reduce
-  Record.reduceRight
-  Record.rest
-  Record.reverse
-  Record.skip
-  Record.skipLast
-  Record.skipUntil
-  Record.skipWhile
-  Record.slice
-  Record.some
-  Record.sort
-  Record.sortBy
-  Record.take
-  Record.takeLast
-  Record.takeUntil
-  Record.takeWhile
-  Record.toArray
-  Record.toIndexedSeq
-  Record.toKeyedSeq
-  Record.toList
-  Record.toMap
-  Record.toOrderedMap
-  Record.toOrderedSet
-  Record.toSet
-  Record.toSetSeq
-  Record.toStack
-  Record.valueSeq
-  Record.values

+  Seq.[Symbol.iterator]
+  Seq.toJSON
+  Seq.update
+  Seq.Indexed.[Symbol.iterator]
+  Seq.Indexed.toJSON
+  Seq.Indexed.update
+  Seq.Indexed.zipAll
+  Seq.Keyed.[Symbol.iterator]
+  Seq.Keyed.toJSON
+  Seq.Keyed.update
+  Seq.Set.[Symbol.iterator]
+  Seq.Set.toJSON
+  Seq.Set.update

+  Set.[Symbol.iterator]
+  Set.toJSON
+  Set.update
+  Set.wasAltered

+  Stack.[Symbol.iterator]
+  Stack.toJSON
+  Stack.update
+  Stack.wasAltered
+  Stack.zipAll

+  ValueObject.equals
+  ValueObject.hashCode

-  Iterable.*
-  Iterable.Indexed.*
-  Iterable.Keyed.*
-  Iterable.Set.*
```

</details>

### Note for users of v4.0.0-rc.12

There were mostly bugfixes and improvements since RC 12. Upgrading should be painless for most users.
However, there is **one breaking change**: The behavior of `merge` and `mergeDeep` has changed. See below for details.

### BREAKING

#### [merge()](<https://immutable-js.com/docs/latest@main/merge()/>)

- No longer use value-equality within `merge()` ([#1391](https://github.com/immutable-js/immutable-js/pull/1391))

  > This rectifies an inconsistent behavior between `x.merge(y)` and `x.mergeDeep(y)` where merge would
  > use `===` on leaf values to determine return-self optimizations, while mergeDeep would use `is()`.
  > This improves consistency across the library and avoids a possible performance pitfall.

- No longer deeply coerce argument to merge() ([#1339](https://github.com/immutable-js/immutable-js/pull/1339))
  > Previously, the argument provided to `merge()` was deeply converted to Immutable collections via `fromJS()`.
  > This was the only function in the library which calls `fromJS()` indirectly,
  > and it was surprising and made it difficult to understand what the result of `merge()` would be.
  > Now, the value provided to `merge()` is only shallowly converted to an Immutable collection, similar to
  > related methods in the library. This may change the behavior of your calls to `merge()`.

#### [mergeDeep()](<https://immutable-js.com/docs/latest@main/mergeDeep()/>)

- Replace incompatible collections when merging nested data ([#1840](https://github.com/immutable-js/immutable-js/pull/1840))

  > It will no longer merge lists of tuples into maps. For more information see
  > [#1840](https://github.com/immutable-js/immutable-js/pull/1840) and the updated `mergeDeep()` documentation.

- Concat Lists when merging deeply ([#1344](https://github.com/immutable-js/immutable-js/pull/1344))
  > Previously, calling `map.mergeDeep()` with a value containing a `List` would replace the values in the
  > original List. This has always been confusing, and does not properly treat `List` as a monoid.
  > Now, `List.merge` is simply an alias for `List.concat`, and `map.mergeDeep()` will concatenate deeply-found lists
  > instead of replacing them.

#### [Seq](https://immutable-js.com/docs/latest@main/Seq/)

- Remove IteratorSequence. Do not attempt to detect iterators in `Seq()`. ([#1589](https://github.com/immutable-js/immutable-js/pull/1589))

  > Iterables can still be provided to `Seq()`, and _most_ Iterators are also
  > Iterables, so this change should not affect the vast majority of uses.
  > For more information, see PR #1589

- Remove `Seq.of()` (#1311, #1310)
  > This method has been removed since it cannot be correctly typed. It's recommended to convert
  > `Seq.of(1, 2, 3)` to `Seq([1, 2, 3])`.

#### [isImmutable()](<https://immutable-js.com/docs/latest@main/isImmutable()/>)

- `isImmutable()` now returns true for collections currently within a `withMutations()` call. ([#1374](https://github.com/immutable-js/immutable-js/pull/1374))

  > Previously, `isImmutable()` did double-duty of both determining if a value was a Collection or Record
  > from this library as well as if it was outside a `withMutations()` call.
  > This latter case caused confusion and was rarely used.

#### [toArray()](<https://immutable-js.com/docs/latest@main/Collection.Keyed#toArray()>)

- KeyedCollection.toArray() returns array of tuples. ([#1340](https://github.com/immutable-js/immutable-js/pull/1340))

  > Previously, calling `toArray()` on a keyed collection (incl `Map` and `OrderedMap`) would
  > discard keys and return an Array of values. This has always been confusing, and differs from `Array.from()`.
  > Now, calling `toArray()` on a keyed collection will return an Array of `[key, value]` tuples, matching
  > the behavior of `Array.from()`.

#### [concat()](<https://immutable-js.com/docs/latest@main/List/#concat()>)

- `list.concat()` now has a slightly more efficient implementation and `map.concat()` is an alias for `map.merge()`. ([#1373](https://github.com/immutable-js/immutable-js/pull/1373))

  > In rare cases, this may affect use of `map.concat()` which expected slightly different behavior from `map.merge()`.

#### [Collection](https://immutable-js.com/docs/latest@main/Collection/), formerly `Iterable`

- The `Iterable` class has been renamed to `Collection`, and `isIterable()` has been renamed to `isCollection()`.
  Aliases with the existing names exist to make transitioning code easier.

#### [Record](https://immutable-js.com/docs/latest@main/Record/)

- Record is no longer an Immutable Collection type.
  - Now `isCollection(myRecord)` returns `false` instead of `true`.
  - The sequence API (such as `map`, `filter`, `forEach`) no longer exist on Records.
  - `delete()` and `clear()` no longer exist on Records.

#### Other breaking changes

- **Potentially Breaking:** Improve hash speed and avoid collision for common values ([#1629](https://github.com/immutable-js/immutable-js/pull/1629))

  > Causes some hash values to change, which could impact the order of iteration of values in some Maps
  > (which are already advertised as unordered, but highlighting just to be safe)

- Node buffers no longer considered value-equal ([#1437](https://github.com/immutable-js/immutable-js/pull/1437))

- Plain Objects and Arrays are no longer considered opaque values ([#1369](https://github.com/immutable-js/immutable-js/pull/1369))

  > This changes the behavior of a few common methods with respect to plain Objects and Arrays where these were
  > previously considered opaque to `merge()` and `setIn()`, they now are treated as collections and can be merged
  > into and updated (persistently). This offers an exciting alternative to small Lists and Records.

- The "predicate" functions, `isCollection`, `isKeyed`, `isIndexed`, `isAssociative` have been moved from `Iterable.` to the top level exports.

- The `toJSON()` method performs a shallow conversion (previously it was an alias for `toJS()`, which remains a deep conversion).

- Some minor implementation details have changed, which may require updates to libraries which deeply integrate with Immutable.js's private APIs.

- The Cursor API is officially deprecated. Use [immutable-cursor](https://github.com/redbadger/immutable-cursor) instead.

- **Potentially Breaking:** [TypeScript] Remove `Iterable<T>` as tuple from Map constructor types ([#1626](https://github.com/immutable-js/immutable-js/pull/1626))
  > Typescript allowed constructing a Map with a list of List instances, assuming each was a key, value pair.
  > While this runtime behavior still works, this type led to more issues than it solved, so it has been removed.
  > (Note, this may break previous v4 rcs, but is not a change against v3)

### New

- Update TypeScript and Flow definitions:
  - The Flowtype and TypeScript type definitions have been completely rewritten with much higher quality and accuracy,
    taking advantage of the latest features from both tools.
  - Simplified TypeScript definition files to support all UMD use cases ([#1854](https://github.com/immutable-js/immutable-js/pull/1854))
  - Support Typescript 3 ([#1593](https://github.com/immutable-js/immutable-js/pull/1593))
  - Support Typescript strictNullChecks ([#1168](https://github.com/immutable-js/immutable-js/pull/1168))
  - Flow types to be compatible with the latest version 0.160.0
  - Enable flow strict ([#1580](https://github.com/immutable-js/immutable-js/pull/1580))

<!-- 4.0.0-rc.15 -->

- Add "sideEffects: false" to package.json ([#1661](https://github.com/immutable-js/immutable-js/pull/1661))

- Use ES standard for iterator method reuse ([#1867](https://github.com/immutable-js/immutable-js/pull/1867))

- Generalize `fromJS()` and `Seq()` to support Sets ([#1865](https://github.com/immutable-js/immutable-js/pull/1865))

- Top level predicate functions ([#1600](https://github.com/immutable-js/immutable-js/pull/1600))

  > New functions are exported from the `immutable` module:
  > `isSeq()`, `isList()`, `isMap()`, `isOrderedMap()`, `isStack()`, `isSet()`, `isOrderedSet()`, and `isRecord()`.

- Improve performance of toJS ([#1581](https://github.com/immutable-js/immutable-js/pull/1581))

  > Cursory test is >10% faster than both v3.8.2 and v4.0.0-rc.7,
  > and corrects the regression since v4.0.0-rc.9.

- Added optional `notSetValue` in `first()` and `last()` ([#1556](https://github.com/immutable-js/immutable-js/pull/1556))

- Make `isArrayLike` check more precise to avoid false positives ([#1520](https://github.com/immutable-js/immutable-js/pull/1520))

- `map()` for List, Map, and Set returns itself for no-ops ([#1455](https://github.com/immutable-js/immutable-js/pull/1455)) (5726bd1)

- Hash functions as objects, allowing functions as values in collections ([#1485](https://github.com/immutable-js/immutable-js/pull/1485))

- Functional API for `get()`, `set()`, and more which support both Immutable.js collections and plain Objects and Arrays ([#1369](https://github.com/immutable-js/immutable-js/pull/1369))

- Relicensed as MIT ([#1320](https://github.com/immutable-js/immutable-js/pull/1320))

- Support for Transducers! ([ee9c68f1](https://github.com/immutable-js/immutable-js/commit/ee9c68f1d43da426498ee009ecea37aa2ef77cb8))

- Add new method, `zipAll()` ([#1195](https://github.com/immutable-js/immutable-js/pull/1195))

- Bundle and distribute an "es module" so Webpack and Rollup can use tree-shaking for smaller builds ([#1204](https://github.com/immutable-js/immutable-js/pull/1204))

- Warn instead of throw when `getIn()` has a bad path ([668f2236](https://github.com/immutable-js/immutable-js/commit/668f2236642c97bd4e7d8dfbf62311f497a6ac18))

- A new predicate function `isValueObject()` helps to detect objects which implement `equals()` and `hashCode()`,
  and type definitions now define the interface `ValueObject` which you can implement in your own code to create objects which
  behave as values and can be keys in Maps or entries in Sets.

- Using `fromJS()` with a "reviver" function now provides access to the key path to each translated value. ([#1118](https://github.com/immutable-js/immutable-js/pull/1118))

### Fixed

- Fix issue with IE11 and missing Symbol.iterator ([#1850](https://github.com/immutable-js/immutable-js/pull/1850))

- Fix ordered set with map ([#1663](https://github.com/immutable-js/immutable-js/pull/1663))

- Do not modify iter during List.map and Map.map ([#1649](https://github.com/immutable-js/immutable-js/pull/1649))

- Fix ordered map delete all ([#1777](https://github.com/immutable-js/immutable-js/pull/1777))

- Hash symbols as objects ([#1753](https://github.com/immutable-js/immutable-js/pull/1753))

- Fix returning a Record in merge() when Record is empty ([#1785](https://github.com/immutable-js/immutable-js/pull/1785))

- Fix for RC~12: Records from different factories aren't equal ([#1734](https://github.com/immutable-js/immutable-js/issues/1734))

- "too much recursion" error when creating a Record type from an instance of another Record ([#1690](https://github.com/immutable-js/immutable-js/pull/1690))

- Fix glob for npm format script on Windows ([#18](https://github.com/immutable-js-oss/immutable-js/pull/18))

- Remove deprecated cursor API ([#13](https://github.com/immutable-js-oss/immutable-js/issues/13))

- Add missing es exports ([#1740](https://github.com/immutable-js/immutable-js/pull/1740))

- Support nulls in genTypeDefData.js ([#185](https://github.com/immutable-js/immutable-js/pull/185))

- Support isPlainObj in IE11 and other esoteric parameters [f3a6d5ce](https://github.com/immutable-js/immutable-js/pull/1833/commits/f3a6d5ce75bb9d60b87074240838f5429e896b60)

- `Set.map` produces valid underlying map ([#1606](https://github.com/immutable-js/immutable-js/pull/1606))

- Support isPlainObj with `constructor` key ([#1627](https://github.com/immutable-js/immutable-js/pull/1627))

- `groupBy` no longer returns a mutable Map instance ([#1602](https://github.com/immutable-js/immutable-js/pull/1602))

- Fix issue where refs can recursively collide, corrupting `.size` ([#1598](https://github.com/immutable-js/immutable-js/pull/1598))

- Throw error in `mergeWith()` method if missing the required `merger` function ([#1543](https://github.com/immutable-js/immutable-js/pull/1543))

- Update `isPlainObj()` to workaround Safari bug and allow cross-realm values ([#1557](https://github.com/immutable-js/immutable-js/pull/1557))

- Fix missing "& T" to some methods in RecordInstance ([#1464](https://github.com/immutable-js/immutable-js/pull/1464))

- Make notSetValue optional for typed Records ([#1461](https://github.com/immutable-js/immutable-js/pull/1461)) (a1029bb)

- Export type of RecordInstance ([#1434](https://github.com/immutable-js/immutable-js/pull/1434))

- Fix Record `size` check in merge() ([#1521](https://github.com/immutable-js/immutable-js/pull/1521))

- Fix Map#concat being not defined ([#1402](https://github.com/immutable-js/immutable-js/pull/1402))

<!-- 4.0.0-rc.9 -->

<!-- 4.0.0-rc.8 -->

- `getIn()` no longer throws when encountering a missing path ([#1361](https://github.com/immutable-js/immutable-js/pull/1361))

<!-- 4.0.0-rc.6 -->

- Do not throw when printing value that cannot be coerced to primitive ([#1334](https://github.com/immutable-js/immutable-js/pull/1334))

<!-- 4.0.0-rc.4 -->

<!-- 4.0.0-rc.3 -->

- Do not throw from hasIn ([#1319](https://github.com/immutable-js/immutable-js/pull/1319))

- Long hash codes no longer cause an infinite loop ([#1175](https://github.com/immutable-js/immutable-js/pull/1175))

- `slice()` which should return an empty set could return a full set or vice versa (#1245, #1287)

- Ensure empty slices do not throw when iterated ([#1220](https://github.com/immutable-js/immutable-js/pull/1220))

- Error during equals check on Record with undefined or null ([#1208](https://github.com/immutable-js/immutable-js/pull/1208))

- Fix size of count() after filtering or flattening ([#1171](https://github.com/immutable-js/immutable-js/pull/1171))

## [3.8.2] - 2017-10-05

Released in 2017, still the most commonly used release.

[unreleased]: https://github.com/immutable-js/immutable-js/compare/v4.0.0-rc.15...HEAD
[4.0.0]: https://github.com/immutable-js/immutable-js/compare/v3.8.2...v4.0.0-rc.15
[3.8.2]: https://github.com/immutable-js/immutable-js/compare/3.7.6...v3.8.2
