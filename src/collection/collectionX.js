import { Map, mapCreateEmpty } from '../Map';

import { OrderedMap } from '../OrderedMap';

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
import { get } from '../functional/get';
import { remove } from '../functional/remove';
import { set } from '../functional/set';
import { updateIn } from '../functional/updateIn';
import { isImmutable } from '../predicates/isImmutable';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';
import { isSeq } from '../predicates/isSeq';
import { probeIsMergeable } from '../probe';
import {
  shallowCopy,
  hasOwnProperty,
  arrCopy,
  quoteString,
  coerceKeyPath,
} from '../utils';
import isDataStructure from '../utils/isDataStructure';
import { collectionIndexedSeqPropertiesCreate } from './collectionIndexedSeq.js';
import { collectionKeyedSeqPropertiesCreate } from './collectionKeyedSeq.js';
import { collectionSeqCreate } from './collectionSeq.js';

const collectionXReify = (cx, seq) => {
  return cx === seq
    ? cx
    : isSeq(cx)
      ? seq
      : cx.create
        ? cx.create(seq)
        : cx.constructor(seq);
};

const collectionXProbeCreator = (cx) =>
  isKeyed(cx)
    ? SeqKeyedWhenNotKeyed
    : isIndexed(cx)
      ? SeqIndexedWhenNotIndexed
      : SeqSetWhenNotAssociative;

const collectionXMakeSequence = (cx) => {
  return Object.create(
    isKeyed(cx)
      ? collectionKeyedSeqPropertiesCreate()
      : isIndexed(cx)
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
  const collectionsJoined = [cx].concat(arrCopy(collections));
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
    head + ' ' + cx.toSeq().map(cx.__toStringMapper).join(', ') + ' ' + tail
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

const collectionXOpMergeWithSources = (collection, sources, merger) => {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot merge into non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
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
          merged = shallowCopy(merged);
        }
        merged.push(value);
      }
    : (value, key) => {
        const hasVal = hasOwnProperty.call(merged, key);
        const nextVal =
          hasVal && merger ? merger(merged[key], value, key) : value;
        if (!hasVal || nextVal !== merged[key]) {
          // Copy on write
          if (merged === collection) {
            merged = shallowCopy(merged);
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
    return isDataStructure(oldValue) &&
      isDataStructure(newValue) &&
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
  return updateIn(cx, keyPath, mapCreateEmpty(), (cx) => {
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
  return updateIn(cx, keyPath, mapCreateEmpty(), (m) =>
    collectionXOpMergeWithSources(m, iters)
  );
};

const collectionXKeyedOpMapEntries = (cx, mapper, context) => {
  let iterations = 0;
  return collectionXReify(
    cx,
    cx
      .toSeq()
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
    OrderedMap,
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
  return arrCopy(args);
}

const collectionXIndexedOpZip = (cx, collections) => {
  collections = [cx].concat(arrCopy(collections));
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
  collections = [cx].concat(arrCopy(collections));
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
  collections = [cx].concat(arrCopy(collections));

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
          update(collection, key, NOT_SET, (oldVal) =>
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

export {
  collectionXReify,
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
