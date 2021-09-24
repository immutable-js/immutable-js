# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Dates are formatted as YYYY-MM-DD.

## [Unreleased]

Nothing yet

## [4.0.0] - 2021-09-30

This release contains new stuff, many fixes, updated Type Definitions and a new, versioned documentation.

### Key changes

* Updated type definitions
* Versioned documentation on a new website: [immutable-js.com](https://immutable-js.com/)
* Project has been relicensed as MIT

### BREAKING

<!-- 4.0.0-rc.15 -->
* Replace incompatible collections when merging nested data with `mergeDeep()` (#1840)
  * This means that `mergeDeep()` will no longer merge lists of tuples into maps. For more information see https://github.com/immutable-js/immutable-js/pull/1840 and the updated `mergeDeep()` documentation.

<!-- 4.0.0-rc.14 -->

<!-- 4.0.0-rc.13 -->

<!-- 4.0.0-rc.12 -->

<!-- 4.0.0-rc.11 -->


* **Potentially Breaking:** Improve hash speed and avoid collision for common values (#1629)
  > Causes some hash values to change, which could impact the order of iteration of values in some Maps (which are already advertised as unordered, but highlighting just to be safe)
* **Potentially Breaking:** [TypeScript] Remove `Iterable<T>` as tuple from Map constructor types (#1626)
  > Typescript allowed constructing a Map with a list of List instances, assuming each was a key, value pair. While this runtime behavior still works, this type led to more issues than it solved so it has been removed. (Note, this may break previous v4 rcs, but is not a change against v3)

<!-- 4.0.0-rc.10 -->
* Remove IteratorSequence. Do not attempt to detect iterators in `Seq()`. (#1589)
  > Iterables can still be provided to `Seq()`, and *most* Iterators are also
  > Iterables, so this change should not affect the vast majority of uses.
  > For more information, see PR #1589
* Node buffers no longer considered value-equal
  > This was actually broken as of v4.0.0-rc.1 (2dcf3ef94db9664c99a0a48fd071b95c0008e18f)
  > but was highlighted as a breaking change by (#1437)

<!-- 4.0.0-rc.9 -->

<!-- 4.0.0-rc.8 -->

- `list.concat()` now has a slightly more efficient implementation and `map.concat()` is an alias for `map.merge()`. (#1373)

  In rare cases, this may affect use of `map.concat()` which expected slightly different behavior from `map.merge()`.

- `isImmutable()` now returns true for collections currently within a `withMutations()` call. (#1374)

  Previously, `isImmutable()` did double-duty of both determining if a value was a Collection or Record from this library as well as if it was outside a `withMutations()` call. This latter case caused confusion and was rarely used.

- Plain Objects and Arrays are no longer considered opaque values (#1369)

  This changes the behavior of a few common methods with respect to plain Objects and Arrays where these were previously considered opaque to `merge()` and `setIn()`, they now are treated as collections and can be merged into and updated (persistently). This offers an exciting alternative to small Lists and Records.

- No longer use value-equality within `merge()` (#1391)

  This rectifies an inconsistent behavior between x.merge(y) and x.mergeDeep(y) where merge would use === on leaf values to determine return-self optimizations, while mergeDeep would use `is()`. This improves consistency across the library and avoids a possible performance pitfall.

<!-- 4.0.0-rc.7 -->

<!-- 4.0.0-rc.6 -->

<!-- 4.0.0-rc.5 -->
* Concat Lists when merging deeply (#1344)

  Previously, calling `map.mergeDeep()` with a value containing a `List` would replace the values in the original List. This has always been confusing, and does not properly treat `List` as a monoid. Now, `List.merge` is simply an alias for `List.concat`, and `map.mergeDeep()` will concatenate lists instead of replacing them.

* No longer deeply coerce argument to merge() (#1339)

  Previously, the argument provided to `merge()` was deeply converted to Immutable collections via `fromJS()`. This was the only function in the library which calls `fromJS()` indirectly directly, and it was surprising and made it difficult to understand what the result of `merge()` would be. Now, the value provided to `merge()` is only shallowly converted to an Immutable collection, similar to related methods in the library. This may change the behavior of your calls to `merge()`.

* KeyedCollection.toArray() returns array of tuples. (#1340)

  Previously, calling `toArray()` on a keyed collection (incl `Map` and `OrderedMap`) would discard keys and return an Array of values. This has always been confusing, and differs from `Array.from()`. Now, calling `toArray()` on a keyed collection will return an Array of `[key, value]` tuples, matching the behavior of `Array.from()`.


<!-- 4.0.0-rc.4 -->

<!-- 4.0.0-rc.3 -->
* Remove Seq.of() (#1311, #1310 )

  This method has been removed since it cannot be correctly typed. It's recommended to convert `Seq.of(1, 2, 3)` to `Seq([1, 2, 3])`.


<!-- 4.0.0-rc.2 -->

<!-- 4.0.0-rc.1 -->
* The `Iterable` class has been renamed to `Collection`, and `isIterable()` has been renamed to `isCollection()`. Aliases with the existing names exist to make transitioning code easier.

* The "predicate" functions, `isCollection`, `isKeyed`, `isIndexed`, `isAssociative` have been moved from `Iterable.` to the top level exports.

* Record is no longer an Immutable Collection type.
  * Now `isCollection(myRecord)` returns `false` instead of `true`.
  * The sequence API (such as `map`, `filter`, `forEach`) no longer exist on Records.
  * `delete()` and `clear()` no longer exist on Records.

* The `toJSON()` method is now a shallow conversion (previously it was an alias for `toJS()`, which remains a deep conversion).

* Some minor implementation details have changed, which may require updates to libraries which deeply integrate with Immutable.js's private APIs.

* The Cursor API is officially deprecated. Use [immutable-cursor](https://github.com/redbadger/immutable-cursor) instead.



### New

<!-- 4.0.0-rc.15 -->
* Add "sideEffects: false" to package.json (#1661)
* Update Flow types to be compatible with the latest version (#1863)
* Use ES standard for iterator method reuse (#1867)
* Generalize `fromJS()` and `Seq()` to support Sets (#1865)

<!-- 4.0.0-rc.14 -->

<!-- 4.0.0-rc.13 -->

<!-- 4.0.0-rc.12 -->

<!-- 4.0.0-rc.11 -->

<!-- 4.0.0-rc.10 -->

* Top level predicate functions (#1600)
  > New functions are exported from the `immutable` module:
  > `isSeq()`, `isList()`, `isMap()`, `isOrderedMap()`, `isStack()`, `isSet()`, `isOrderedSet()`, and `isRecord()`.
* Support Typescript 3 (#1593)
* Support latest Flow (#1531)
* Add `RecordOf<TProps>` type alias for TypeScript, matching Flow (#1578)
* Improved Flow support for Record subclasses (still not advised) (#1414)
* Improve performance of toJS (#1581)
  > Cursory test is >10% faster than both v3.8.2 and v4.0.0-rc.7,
  > and corrects the regression since v4.0.0-rc.9.
* Added optional `notSetValue` in `first()` and `last()` (#1556)
* Enable flow strict (#1580)
* Make `isArrayLike` check more precise to avoid false positives (#1520)
* `map()` for List, Map, and Set returns itself for no-ops (#1455) (5726bd1)
* Hash functions as objects, allowing functions as values in collections (#1485)


<!-- 4.0.0-rc.9 -->

<!-- 4.0.0-rc.8 -->

* Dramatically better Flow types for `getIn()`, `setIn()`, `updateIn()` which understand key paths (#1366, #1377)
* Functional API for `get()`, `set()`, and more which support both Immutable.js collections and plain Objects and Arrays (#1369)

<!-- 4.0.0-rc.7 -->

<!-- 4.0.0-rc.6 -->

<!-- 4.0.0-rc.5 -->

* Much better documentation for Records (http://facebook.github.io/immutable-js/docs/#/Record) (#1349)
* Include version in build (#1345)
* Flow types `RecordOf<T>` and `RecordFactory<T>` dramatically improve the Flow types for Records (#1343, #1330)

<!-- 4.0.0-rc.4 -->

<!-- 4.0.0-rc.3 -->
* Relicensed as MIT (#1320)
* Support for Transducers! (ee9c68f1d43da426498ee009ecea37aa2ef77cb8)
* A new method, `zipAll()` (#1195)
* Considerably improved Record typing (#1193, #1276)
* Bundle and distribute an "es module" so Webpack and Rollup can use tree-shaking for smaller builds (#1204)
* Warn instead of throw when `getIn()` has a bad path (668f2236642c97bd4e7d8dfbf62311f497a6ac18)
* Improved TypeScript types for `zip()`. (#1258)
* Improved TypeScript types for `has()`. (#1232)
* Support typescript strictNullChecks (#1168)

<!-- 4.0.0-rc.2 -->

<!-- 4.0.0-rc.1 -->
* A new predicate function `isValueObject()` helps to detect objects which implement `equals()` and `hashCode()`, and type definitions now define the interface `ValueObject` which you can implement in your own code to create objects which behave as values and can be keys in Maps or entries in Sets.
* The Flowtype and TypeScript type definitions have been completely rewritten with much higher quality and accuracy, taking advantage of the latest features from both amazing tools.
* Using `fromJS()` with a "reviver" function now provides access to the key path to each translated value. (#1118)



### Fixed

<!-- 4.0.0-rc.15 -->
* Fix some TS type defs (#1847)
  * Adds `ArrayLike<T>` as option to type factory functions and `fromJS` now returns `Collection<unknown>` instead of just `unknown`.
* Fix issue with IE11 and missing Symbol.iterator (#1850)
* Simplify typescript definition files to support all UMD use cases (#1854)

<!-- 4.0.0-rc.14 -->
- Fixes some TypeScript issues (Map constructor, update function, mapEntries)
- Fix add zipall to orderedset
- Improve documentation

<!-- 4.0.0-rc.13 -->
* Fix ordered set with map (#1663)
* fix: do not modify iter during List.map and Map.map (#1649)
* Fix ordered map delete all (#1777)
* Hash symbols as objects (#1753)
* Fix returning a Record in merge() when Record is empty (#1785)
* Similar factories should be equals (#1734)
* "too much recursion" error when creating a Record type from an instance of another Record (#1690)
* Record clear does work (#1565)
* Fix glob for npm format script on Windows https://github.com/immutable-js-oss/immutable-js/pull/18
* Remove deprecated cursor API https://github.com/immutable-js-oss/immutable-js/issues/13
* Add missing es exports (#1740)
* Support nulls in genTypeDefData.js (#185)
* Support isPlainObj in IE11 and other esoteric parameters https://github.com/immutable-js/immutable-js/pull/1833/commits/f3a6d5ce75bb9d60b87074240838f5429e896b60
* Fix benchmarks https://github.com/immutable-js-oss/immutable-js/pull/21
* ensure that subtract works correctly (#1716, #1603)
* assert that setIn works as expected (#1428)
* check that "delete" works as "remove" (#1474)

<!-- 4.0.0-rc.12 -->
* Update to support Flow v0.85 and makes Record strict typing optional to ease migration from v3 or earlier v4 release candidates (#1636)

<!-- 4.0.0-rc.11 -->
* Give Records a `displayName` (#1625)
* `Set.map` produces valid underlying map (#1606)
* Support isPlainObj with `constructor` key (#1627)
* (Documentation) Fix missing sub-types in API docs (#1619)
* (Documentation) Add docsearch (#1610)
* (Documentation) Add styles to doc search (#1628)

<!-- 4.0.0-rc.10 -->
* `groupBy` no longer returns a mutable Map instance (#1602)
* Fix issue where refs can recursively collide, corrupting `.size` (#1598)
* Throw error in `mergeWith()` method if missing the required `merger` function (#1543)
* Update `isPlainObj()` to workaround Safari bug and allow cross-realm values (#1557)
* The `mergeDeepWith` merger is untypable in TS/Flow. (#1532)
* Fix missing "& T" to some methods in RecordInstance (#1464)
* Make notSetValue optional for typed Records (#1461) (a1029bb)
* Export type of RecordInstance (#1434)
* Fix Record `size` check in merge() (#1521)
* Fix Map#concat being not defined (#1402)

<!-- 4.0.0-rc.9 -->
* Improved typescript definitions for new functional API (#1395)
* Improved flow types for Record `setIn()`/`getIn()` key-paths. (#1399)
* Improved flow types for functional `merge()` definitions. (#1400)

<!-- 4.0.0-rc.8 -->
* `getIn()` no longer throws when encountering a missing path (#1361)
* Flow string enums can now be used as Map keys or Record fields (#1376)
* Flow now allows `record.get()` to provide a not-set-value (#1378)
* Fixed Flow return type for `Seq.Set()` (3e671a2b6dc76ab3dd141c65659bce55ffd64f44)

<!-- 4.0.0-rc.7 -->
* Fixed syntax error in typescript definitions which limited some checking (#1354)

<!-- 4.0.0-rc.6 -->

* Flow types now understand `list.filter(Boolean)` will remove null values (#1352)
* Added missing flow types for `Record.hasIn` and `Record.getIn` (#1350)

<!-- 4.0.0-rc.5 -->
* zipAll type should predict undefined values (#1322)
* Do not throw when printing value that cannot be coerced to primitive (#1334)
* Ensure set.subtract() accepts any iterable. (#1338)
* Fix TypeScript definitions for merge functions (#1336)
* Ensure when OrderedSet becomes empty, that it remains OrderedSet (#1335)
* Fix slow iterator for Set (#1333)
* Add proper typescript type for `map.flip()` (#1332)
* Set wasAltered() to false after List.asImmutable() (#1331)

<!-- 4.0.0-rc.4 -->
* Fixed a regression from rc.3 where value hashing was not working (#1325, #1328)
* Stop the iteration of an exhausted, unknown-sized sequence when slicing (#1324)
* Flow type the prototype chain of "plain object" inputs (#1328)

<!-- 4.0.0-rc.3 -->
* Updated Flow types to work with 0.55 and higher (#1312)
* Updated TypeScript types to work with v2.4 and higher (#1285)
* Do not throw from hasIn (#1319)
* Long hash codes no longer cause an infinite loop (#1175)
* `slice()` which should return an empty set could return a full set or vice versa (#1245, #1287)
* Ensure empty slices do not throw when iterated (#1220)
* Error during equals check on Record with undefined or null (#1208)
* Fixes missing size property in flow types. (#1173)
* Fix size of count() after filtering or flattening (#1171)

<!-- 4.0.0-rc.2 -->

* Type definition improvements for `filter()`, `reduce()` and `concat()` (#1155, #1156, #1153)
* More specific TypeScript type definitions (#1149)
* Added back `delete()` and `clear()` to Record instances (#1157)

<span style="color:#AA0000">
<!-- 4.0.0-rc.1 -->
* RC.1
  * This is a **pre-release** version of Immutable.js. Please try it at your own risk and report any issues you encounter so an official release can be shipped with great confidence.
  * As a pre-release, this changelog doesn't contain everything that has changed. Take a look at the [commit log](https://github.com/facebook/immutable-js/commits/master) for a complete view, and expect a more thorough changelog for the official release.
  * Numerous bug fixes have gone into this release.
</span>

## [3.8.2] - 2017-10-05

Released in 2017, still the most commonly used release.


[unreleased]: https://github.com/immutable-js/immutable-js/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/immutable-js/immutable-js/compare/v3.8.2...v4.0.0-rc.5
[3.8.2]: https://github.com/immutable-js/immutable-js/compare/3.7.6...v3.8.2
