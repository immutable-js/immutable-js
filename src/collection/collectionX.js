
import { Map, mapCreateEmpty } from '../Map';

import { MapOrdered } from '../MapOrdered';









import {
  SeqKeyed,
  SeqKeyedFromValue,
  SeqIndexed,
  SeqIndexedFromValue,
  SeqSet,
  SeqWhenNotCollection,
  SeqSetWhenNotAssociative,
  SeqKeyedWhenNotKeyed,
  SeqIndexedWhenNotIndexed,
} from '../Seq';

import { SeqArray } from '../SeqArray';
import { resolveBegin } from '../TrieUtils';
import { NOT_SET } from '../const';
import {
  factoryGroupBy,
  factoryInterpose,
  factoryCountBy,
  factoryPartition,
  factoryFlatMap,
  factorySort,
  factoryFilter,
} from '../factory/factory';
import { factoryConcat } from '../factory/factoryConcat';
import { factoryFlatten } from '../factory/factoryFlatten';
import { factoryFlip } from '../factory/factoryFlip';
import { factoryMap } from '../factory/factoryMap';
import { factoryReverse } from '../factory/factoryReverse';
import { factorySlice } from '../factory/factorySlice';
import { factoryZipWith } from '../factory/factoryZipWith';
import {
  probeIsMergeable,
  probeIsIndexed,
  probeIsImmutable,
  probeIsDataStructure,
  probeCoerceKeyPath,
  probeIsKeyed,
  probeIsSeq,
} from '../probe';
import {
  utilCopyShallow,
  utilHasOwnProperty,
  utilArrCopy,
  utilQuoteString,
} from '../util';
import {
  collectionOrAnyOpGet,
  collectionOrAnyOpSet,
  collectionOrAnyOpRemove,
} from './collection';
import { collectionIndexedSeqPropertiesCreate } from './collectionIndexedSeq.js';
import { collectionKeyedSeqPropertiesCreate } from './collectionKeyedSeq.js';
import { collectionSeqCreate } from './collectionSeq.js';

const collectionXReify = (cx, seq) => {
  return cx === seq
    ? cx
    : probeIsSeq(cx)
      ? seq
      : cx.create
        ? cx.create(seq)
        : cx.constructor(seq);
};

const collectionXProbeCreator = (cx) =>
  probeIsKeyed(cx)
    ? SeqKeyedWhenNotKeyed
    : probeIsIndexed(cx)
      ? SeqIndexedWhenNotIndexed
      : SeqSetWhenNotAssociative;

const collectionXMakeSequence = (cx) => {
  return Object.create(
    probeIsKeyed(cx)
      ? collectionKeyedSeqPropertiesCreate()
      : probeIsIndexed(cx)
        ? collectionIndexedSeqPropertiesCreate()
        : collectionSeqCreate()
  );
};

const collectionXCastKeyedSequenceOpReverse = (cx) => {
  const reversedSequence = factoryReverse(cx, collectionXMakeSequence, true);
  if (!cx._useKeys) {
    reversedSequence.valueSeq = () => cx._iter.toSeq().reverse();
  }
  return reversedSequence;
};

const collectionXCastKeyedSequenceOpMap = (cx, mapper, context) => {
  const mappedSequence = factoryMap(
    cx,
    collectionXMakeSequence,
    mapper,
    context
  );

  if (!cx._useKeys) {
    mappedSequence.valueSeq = () => cx._iter.toSeq().map(mapper, context);
  }
  return mappedSequence;
};

const collectionXOpValueSeq = (cx) => {
  return cx.toIndexedSeq();
};

const collectionXIndexedOpInterpose = (cx, separator) => {
  return collectionXReify(
    cx,
    factoryInterpose(cx, collectionXMakeSequence, separator)
  );
};

const collectionXIndexedOpInterleave = (cx, collections) => {
  const collectionsJoined = [cx].concat(utilArrCopy(collections));
  // const zipper = SeqIndexed.of
  const zipper = SeqIndexed.of;
  const zipped = factoryZipWith(
    cx.toSeq(),
    collectionXMakeSequence,
    SeqWhenNotCollection,
    SeqArray,
    zipper,
    collectionsJoined
  );
  const interleaved = zipped.flatten(true);
  if (zipped.size) {
    interleaved.size = zipped.size * collectionsJoined.length;
  }
  return collectionXReify(cx, interleaved);
};

const collectionXOpToStringDetails = (cx, head, tail) => {
  if (cx.size === 0) {
    return head + tail;
  }
  return (
    head +
    ' ' +
    cx.toSeq().map(cx.__toStringMapper).join(', ') +
    ' ' +
    tail
  );
};

const collectionXOpIsSubset = (cx, iter) => {
  iter =
    typeof iter.includes === 'function' ? iter : SeqWhenNotCollection(iter);
  return cx.every((value) => iter.includes(value));
};

const collectionXOpIsSuperset = (cx, iter) => {
  iter =
    typeof iter.isSubset === 'function' ? iter : SeqWhenNotCollection(iter);
  return iter.isSubset(cx);
};

const collectionXOpFlip = (cx) => {
  return factoryFlip(cx, collectionXMakeSequence(cx));
};

const collectionXOpMap = (cx, mapper, context) => {
  return collectionXReify(
    cx,
    factoryMap(cx, collectionXMakeSequence, mapper, context)
  );
};

const collectionXOpReverse = (cx) => {
  return collectionXReify(
    cx,
    factoryReverse(cx, collectionXMakeSequence, true)
  );
};

const collectionXIndexedOpReverse = (cx) => {
  return collectionXReify(
    cx,
    factoryReverse(cx, collectionXMakeSequence, false)
  );
};

const collectionXOpSlice = (cx, begin, end) => {
  return collectionXReify(
    cx,
    factorySlice(cx, collectionXMakeSequence, begin, end, true)
  );
};

const collectionXOpPartition = (cx, predicate, context) => {
  return factoryPartition(
    cx,
    collectionXProbeCreator,
    collectionXReify,
    predicate,
    context
  );
};

const collectionXIndexedOpSplice = (cx, index, removeNum, args) => {
  const numArgs =
    typeof index === 'undefined'
      ? 0
      : args.length
        ? 3
        : typeof removeNum === 'undefined'
          ? 1
          : 2;
  removeNum = Math.max(removeNum || 0, 0);
  if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
    return cx;
  }
  // If index is negative, it should resolve relative to the size of the
  // collection. However size may be expensive to compute if not cached, so
  // only call count() if the number is in fact negative.
  index = resolveBegin(index, index < 0 ? cx.count() : cx.size);
  const spliced = cx.slice(0, index);

  return collectionXReify(
    cx,
    numArgs === 1 ? spliced : spliced.concat(args, cx.slice(index + removeNum))
  );
};

const collectionXIndexedOpSlice = (cx, begin, end) => {
  return collectionXReify(
    cx,
    factorySlice(cx, collectionXMakeSequence, begin, end, false)
  );
};

const collectionXOpConcat = (cx, values) => {
  return collectionXReify(
    cx,
    factoryConcat(cx, SeqKeyed, SeqKeyedFromValue, SeqIndexedFromValue, values)
  );
};

const collectionXOpFlatMap = (cx, mapper, context) => {
  return collectionXReify(
    cx,
    factoryFlatMap(cx, collectionXProbeCreator, mapper, context)
  );
};

const collectionXOpFlatten = (cx, depth) => {
  return collectionXReify(
    cx,
    factoryFlatten(cx, collectionXMakeSequence, depth, false)
  );
};

const collectionXOpFilter = (cx, predicate, context) => {
  return collectionXReify(
    cx,
    factoryFilter(cx, collectionXMakeSequence, predicate, context, true)
  );
};

function not(predicate) {
  return function () {
    return !predicate.apply(this, arguments);
  };
}

const collectionXOpFilterNot = (cx, predicate, context) => {
  return cx.filter(not(predicate), context);
};

const collectionXIndexedOpFilter = (cx, predicate, context) => {
  return collectionXReify(
    cx,
    factoryFilter(cx, collectionXMakeSequence, predicate, context, false)
  );
};

const collectionXOpTake = (cx, amount) => {
  return cx.slice(0, Math.max(0, amount));
};

const collectionXOpTakeLast = (cx, amount) => {
  return cx.slice(-Math.max(0, amount));
};

const collectionXOpEntrySeq = (cx) => {
  if (cx._cache) {
    // We cache as an entries array, so we can just return the cache!
    //
    return SeqArray(cx._cache);
  }
  function entryMapper(v, k) {
    return [k, v];
  }

  const entriesSequence = cx.toSeq().map(entryMapper).toIndexedSeq();
  entriesSequence.fromEntrySeq = () => cx.toSeq();
  return entriesSequence;
};

const collectionXOpMergeWithSources = (
  collection,
  sources,
  merger
) => {
  if (!probeIsDataStructure(collection)) {
    throw new TypeError(
      'Cannot merge into non-data-structure value: ' + collection
    );
  }
  if (probeIsImmutable(collection)) {
    return typeof merger === 'function' && collection.mergeWith
      ? collection.mergeWith(merger, ...sources)
      : collection.merge
        ? collection.merge(...sources)
        : collection.concat(...sources);
  }
  const isArray = Array.isArray(collection);
  let merged = collection;

  const mergeItem = isArray
    ? (value) => {
        // Copy on write
        if (merged === collection) {
          merged = utilCopyShallow(merged);
        }
        merged.push(value);
      }
    : (value, key) => {
        const hasVal = utilHasOwnProperty.call(merged, key);
        const nextVal =
          hasVal && merger ? merger(merged[key], value, key) : value;
        if (!hasVal || nextVal !== merged[key]) {
          // Copy on write
          if (merged === collection) {
            merged = utilCopyShallow(merged);
          }
          merged[key] = nextVal;
        }
      };
  const Collection = isArray ? SeqIndexedWhenNotIndexed : SeqKeyedWhenNotKeyed;
  for (let i = 0; i < sources.length; i++) {
    Collection(sources[i]).forEach(mergeItem);
  }
  return merged;
};

/**
 * It's unclear what the desired behavior is for merging two collections that
 * fall into separate categories between keyed, indexed, or set-like, so we only
 * consider them mergeable if they fall into the same category.
 */
const collectionXOpDeepMergerWith = (merger, collectionCreate) => {
  function deepMerger(oldValue, newValue, key) {
    return probeIsDataStructure(oldValue) &&
      probeIsDataStructure(newValue) &&
      probeIsMergeable(oldValue, newValue)
      ? collectionXOpMergeWithSources(
          oldValue,
          [newValue],
          deepMerger,
          collectionCreate
        )
      : merger
        ? merger(oldValue, newValue, key)
        : newValue;
  }
  return deepMerger;
};

const collectionXOpMergeDeepWith = (cx, merger, iters) => {
  return collectionXOpMergeDeepWithSources(cx, iters, merger);
};

const collectionXOpMergeDeepWithSources = (cx, sources, merger) => {
  return collectionXOpMergeWithSources(
    cx,
    sources,
    collectionXOpDeepMergerWith(merger, cx),
    cx // recursive calls maintain this value to use definitions from it
  );
};

const collectionXOpMergeDeep = (cx, iters) => {
  return collectionXOpMergeDeepWithSources(cx, iters);
};

const collectionXOpMergeDeepIn = (cx, keyPath, iters) => {
  return collectionXOrAnyOpUpdateIn(cx, keyPath, mapCreateEmpty(), (cx) => {
    return collectionXOpMergeDeepWithSources(cx, iters);
  });
};

const collectionXOpMergeWith = (cx, merger, iters) => {
  return collectionXOpMergeIntoKeyedWith(
    cx,
    iters,
    merger,
    SeqKeyedWhenNotKeyed
  );
};

const collectionXOpMerge = (cx, iters) => {
  return collectionXOpMergeIntoKeyedWith(
    cx,
    iters,
    undefined,
    SeqKeyedWhenNotKeyed
  );
};

const collectionXOpMergeIn = (cx, keyPath, iters) => {
  return collectionXOrAnyOpUpdateIn(cx, keyPath, mapCreateEmpty(), (m) =>
    collectionXOpMergeWithSources(m, iters)
  );
};

const collectionXKeyedOpMapEntries = (cx, mapper, context) => {
  let iterations = 0;
  return collectionXReify(
    cx,
    cx.toSeq()
      .map((v, k) => mapper.call(context, [k, v], iterations++, cx))
      .fromEntrySeq()
  );
};

const collectionXKeyedOpFlip = (cx) => {
  return collectionXReify(cx, factoryFlip(cx, collectionXMakeSequence(cx)));
};

const collectionXOpGroupBy = (cx, grouper, context) => {
  return factoryGroupBy(
    cx,
    Map,
    MapOrdered,
    collectionXReify,
    collectionXProbeCreator,
    grouper,
    context
  );
};

const collectionXKeyedOpMapKeys = (collection, mapper, context) => {
  return collectionXReify(
    collection,
    collection
      .toSeq()
      .flip()
      .map((k, v) => mapper.call(context, k, v, collection))
      .flip()
  );
};

const collectionXOpLastKeyOf = (cx, searchValue) => {
  return cx.toKeyedSeq().reverse().keyOf(searchValue);
};

const collectionXOpSortBy = (cx, mapper, comparator) => {
  return collectionXReify(
    cx,
    factorySort(cx, SeqKeyed, SeqIndexed, SeqSet, comparator, mapper)
  );
};

const collectionXOpSort = (cx, comparator) => {
  return collectionXReify(
    cx,
    factorySort(cx, SeqKeyed, SeqIndexed, SeqSet, comparator)
  );
};

function defaultZipper(...args) {
  return utilArrCopy(args);
}

const collectionXIndexedOpZip = (cx, collections) => {
  collections = [cx].concat(utilArrCopy(collections));
  return collectionXReify(
    cx,
    factoryZipWith(
      cx,
      collectionXMakeSequence,
      SeqWhenNotCollection,
      SeqArray,
      defaultZipper,
      collections
    )
  );
};

const collectionXIndexedOpZipAll = (cx, collections) => {
  collections = [cx].concat(utilArrCopy(collections));
  return collectionXReify(
    cx,
    factoryZipWith(
      cx,
      collectionXMakeSequence,
      SeqWhenNotCollection,
      SeqArray,
      defaultZipper,
      collections,
      true
    )
  );
};

const collectionXIndexedOpZipWith = (cx, zipper, collections) => {
  collections = [cx].concat(utilArrCopy(collections));

  return collectionXReify(
    cx,
    factoryZipWith(
      cx,
      collectionXMakeSequence,
      SeqWhenNotCollection,
      SeqArray,
      zipper,
      collections
    )
  );
};

const collectionXOpCountBy = (cx, grouper, context) => {
  return factoryCountBy(cx, grouper, context, Map);
};

const collectionXOpMergeIntoKeyedWith = (
  collection,
  collections,
  merger,
  keyedCollectionCreate
) => {
  const iters = [];
  for (let ii = 0; ii < collections.length; ii++) {
    const collection = keyedCollectionCreate(collections[ii]);
    if (collection.size !== 0) {
      iters.push(collection);
    }
  }
  if (iters.length === 0) {
    return collection;
  }
  if (
    collection.toSeq().size === 0 &&
    !collection.__ownerID &&
    iters.length === 1
  ) {
    return collection.create(iters[0]);
  }
  return collection.withMutations((collection) => {
    const mergeIntoCollection = merger
      ? (value, key) => {
          collectionXOrAnyOpUpdate(collection, key, NOT_SET, (oldVal) =>
            oldVal === NOT_SET ? value : merger(oldVal, value, key)
          );
        }
      : (value, key) => {
          collection.set(key, value);
        };
    for (let ii = 0; ii < iters.length; ii++) {
      iters[ii].forEach(mergeIntoCollection);
    }
  });
};

/**
 * Returns a copy of the collection with the value at key path set to the
 * result of providing the existing value to the updating function.
 *
 * A functional alternative to `collection.updateIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { updateIn } from 'immutable'
 *
 * const original = { x: { y: { z: 123 }}}
 * updateIn(original, ['x', 'y', 'z'], val => val * 6) // { x: { y: { z: 738 }}}
 * console.log(original) // { x: { y: { z: 123 }}}
 * ```
 */
const collectionXOrAnyOpUpdateInDeeply = (
  inImmutable,
  existing,
  keyPath,
  i,
  notSetValue,
  updater,
  mapEmptyCreate
) => {
  const wasNotSet = existing === NOT_SET;
  if (i === keyPath.length) {
    const existingValue = wasNotSet ? notSetValue : existing;
    // @ts-expect-error mixed type with optional value
    const newValue = updater(existingValue);
    // @ts-expect-error mixed type
    return newValue === existingValue ? existing : newValue;
  }
  if (!wasNotSet && !probeIsDataStructure(existing)) {
    throw new TypeError(
      'Cannot update within non-data-structure value in path [' +
        Array.from(keyPath).slice(0, i).map(utilQuoteString) +
        ']: ' +
        existing
    );
  }
  const key = keyPath[i];

  if (typeof key === 'undefined') {
    throw new TypeError(
      'Index can not be undefined in updateIn(). This should not happen'
    );
  }

  const nextExisting = wasNotSet
    ? NOT_SET
    : collectionOrAnyOpGet(existing, key, NOT_SET);
  const nextUpdated = collectionXOrAnyOpUpdateInDeeply(
    nextExisting === NOT_SET ? inImmutable : probeIsImmutable(nextExisting),
    // @ts-expect-error mixed type
    nextExisting,
    keyPath,
    i + 1,
    notSetValue,
    updater,
    mapEmptyCreate
  );
  return nextUpdated === nextExisting
    ? existing
    : nextUpdated === NOT_SET
      ? collectionOrAnyOpRemove(existing, key)
      : collectionOrAnyOpSet(
          wasNotSet ? (inImmutable ? mapEmptyCreate() : {}) : existing,
          key,
          nextUpdated
        );
};

const collectionXOrAnyOpUpdateIn = (
  cx,
  keyPath,
  notSetValue,
  updater
) => {
  if (!updater) {
    // handle the fact that `notSetValue` is optional here, in that case `updater` is the updater function
    // @ts-expect-error updater is a function here
    updater = notSetValue;
    notSetValue = undefined;
  }
  const updatedValue = collectionXOrAnyOpUpdateInDeeply(
    probeIsImmutable(cx),
    // @ts-expect-error type issues with Record and mixed types
    cx,
    probeCoerceKeyPath(keyPath),
    0,
    notSetValue,
    updater,
    mapCreateEmpty
  );
  // @ts-expect-error mixed return type
  return updatedValue === NOT_SET ? notSetValue : updatedValue;
};

/**
 * Returns a copy of the collection with the value at the key path removed.
 *
 * A functional alternative to `collection.removeIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { removeIn } from 'immutable';
 *
 * const original = { x: { y: { z: 123 }}}
 * removeIn(original, ['x', 'y', 'z']) // { x: { y: {}}}
 * console.log(original) // { x: { y: { z: 123 }}}
 * ```
 */
const collectionXOrAnyOpRemoveIn = (cx, keyPath) => {
  return collectionXOrAnyOpUpdateIn(cx, keyPath, () => NOT_SET);
};

/**
 * Returns a copy of the collection with the value at key set to the result of
 * providing the existing value to the updating function.
 *
 * A functional alternative to `collection.update(key, fn)` which will also
 * work with plain Objects and Arrays as an alternative for
 * `collectionCopy[key] = fn(collection[key])`.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { update } from 'immutable';
 *
 * const originalArray = [ 'dog', 'frog', 'cat' ]
 * update(originalArray, 1, val => val.toUpperCase()) // [ 'dog', 'FROG', 'cat' ]
 * console.log(originalArray) // [ 'dog', 'frog', 'cat' ]
 * const originalObject = { x: 123, y: 456 }
 * update(originalObject, 'x', val => val * 6) // { x: 738, y: 456 }
 * console.log(originalObject) // { x: 123, y: 456 }
 * ```
 */
const collectionXOrAnyOpUpdate = (cx, key, notSetValue, updater) => {
  return collectionXOrAnyOpUpdateIn(
    // @ts-expect-error Index signature for type string is missing in type V[]
    cx,
    [key],
    notSetValue,
    updater,
    null,
    null
  );
};

/**
 * Returns a copy of the collection with the value at the key path set to the
 * provided value.
 *
 * A functional alternative to `collection.setIn(keypath)` which will also
 * work with plain Objects and Arrays.
 *
 * <!-- runkit:activate -->
 * ```js
 * import { setIn } from 'immutable';
 *
 * const original = { x: { y: { z: 123 }}}
 * setIn(original, ['x', 'y', 'z'], 456) // { x: { y: { z: 456 }}}
 * console.log(original) // { x: { y: { z: 123 }}}
 * ```
 */
const collectionXOrAnyOpSetIn = (cx, keyPath, value) => {
  return collectionXOrAnyOpUpdateIn(cx, keyPath, NOT_SET, () => value);
};

export {
  collectionXReify,
  collectionXOrAnyOpUpdateInDeeply,
  collectionXOrAnyOpUpdateIn,
  collectionXOrAnyOpUpdate,
  collectionXOrAnyOpRemoveIn,
  collectionXOrAnyOpSetIn,
  collectionXOpCountBy,
  collectionXOpGroupBy,
  collectionXOpLastKeyOf,
  collectionXOpValueSeq,
  collectionXOpEntrySeq,
  collectionXOpToStringDetails,
  collectionXOpSort,
  collectionXOpSortBy,
  collectionXOpMap,
  collectionXOpMergeIntoKeyedWith,
  collectionXOpMergeDeepWithSources,
  collectionXOpMergeDeep,
  collectionXOpMergeDeepIn,
  collectionXOpDeepMergerWith,
  collectionXOpReverse,
  collectionXOpPartition,
  collectionXOpConcat,
  collectionXOpFilter,
  collectionXOpFilterNot,
  collectionXOpFlatMap,
  collectionXOpFlatten,
  collectionXOpFlip,
  collectionXIndexedOpInterleave,
  collectionXOpIsSubset,
  collectionXOpIsSuperset,
  collectionXOpSlice,
  collectionXOpTake,
  collectionXOpTakeLast,
  collectionXOpMergeIn,
  collectionXOpMergeWithSources,
  collectionXOpMergeWith,
  collectionXOpMergeDeepWith,
  collectionXOpMerge,
  collectionXIndexedOpInterpose,
  collectionXIndexedOpReverse,
  collectionXIndexedOpSlice,
  collectionXIndexedOpSplice,
  collectionXIndexedOpFilter,
  collectionXIndexedOpZip,
  collectionXIndexedOpZipAll,
  collectionXIndexedOpZipWith,
  collectionXKeyedOpMapEntries,
  collectionXKeyedOpMapKeys,
  collectionXKeyedOpFlip,
  collectionXCastKeyedSequenceOpReverse,
  collectionXCastKeyedSequenceOpMap,
};
