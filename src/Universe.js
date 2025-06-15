import { listPropertiesCreate, List } from './List';
import { Map, mapCreateEmpty, mapPropertiesCreate } from './Map';
import { MapOrdered } from './MapOrdered';
import { Range } from './Range';
import {
  SeqWhenNotCollection,
  SeqIndexedWhenNotIndexed,
  SeqKeyedWhenNotKeyed,
} from './Seq';
import { Set } from './Set';
import { SetOrdered, setOrderedPropertiesCreate } from './SetOrdered';
import { Stack } from './Stack';
import { collectionPropertiesCreate } from './collection/collection';
import { collectionCastIndexedSeqCreate } from './collection/collectionCastIndexedSeq.js';
import {
  collectionCastKeyedSeqCreate,
  collectionCastKeyedSeqPropertiesCreate,
} from './collection/collectionCastKeyedSeq';
import { collectionCastSetSeqCreate } from './collection/collectionCastSetSeq.js';
import { collectionIndexedPropertiesCreate } from './collection/collectionIndexed';
import { collectionKeyedPropertiesCreate } from './collection/collectionKeyed';
import { collectionKeyedSeqFromEntriesCreate } from './collection/collectionKeyedSeqFromEntries';
import { collectionRecordPropertiesCreate } from './collection/collectionRecord';
import {
  collectionXOrAnyOpUpdate,
  collectionXOrAnyOpUpdateIn,
  collectionXOrAnyOpRemoveIn,
  collectionXOrAnyOpSetIn,
  collectionXOpCountBy,
  collectionXOpEntrySeq,
  collectionXOpMap,
  collectionXOpReverse,
  collectionXOpSort,
  collectionXOpSortBy,
  collectionXOpSlice,
  collectionXOpPartition,
  collectionXOpFilter,
  collectionXOpFilterNot,
  collectionXOpFlip,
  collectionXOpFlatMap,
  collectionXOpFlatten,
  collectionXOpGroupBy,
  collectionXOpConcat,
  collectionXOpTake,
  collectionXOpTakeLast,
  collectionXOpLastKeyOf,
  collectionXOpMergeIn,
  collectionXOpMergeWith,
  collectionXOpMerge,
  collectionXOpMergeDeep,
  collectionXOpMergeDeepWith,
  collectionXOpMergeDeepIn,
  collectionXOpIsSubset,
  collectionXOpIsSuperset,
  collectionXIndexedOpZip,
  collectionXIndexedOpZipWith,
  collectionXIndexedOpZipAll,
  collectionXIndexedOpInterleave,
  collectionXIndexedOpInterpose,
  collectionXIndexedOpFilter,
  collectionXIndexedOpReverse,
  collectionXIndexedOpSlice,
  collectionXIndexedOpSplice,
  collectionXKeyedOpFlip,
  collectionXKeyedOpMapEntries,
  collectionXKeyedOpMapKeys,
  collectionXCastKeyedSequenceOpReverse,
  collectionXCastKeyedSequenceOpMap,
} from './collection/collectionX';
import { probeIsKeyed, probeIsIndexed } from './probe';
import { toJS } from './toJS';
import transformToMethods from './transformToMethods';

import { flagSpread } from './utils';

Object.assign(
  collectionPropertiesCreate(),
  {
    // primarily used by recursive 'merge deep' functions
    // not passed in as params now to leave interface un-changed
    __SeqIndexedWhenNotIndexed: SeqIndexedWhenNotIndexed,
    __SeqKeyedWhenNotKeyed: SeqKeyedWhenNotKeyed,
    __mapCreateEmpty: mapCreateEmpty,
  },
  transformToMethods({
    toJS,
    toSeq: (cx) =>
      probeIsIndexed(cx)
        ? cx.toIndexedSeq()
        : probeIsKeyed(cx)
          ? cx.toKeyedSeq()
          : cx.toSetSeq(),
    toSetSeq: collectionCastSetSeqCreate,
    toOrderedMap: (cx) => MapOrdered(collectionCastKeyedSeqCreate(cx)),
    toOrderedSet: (cx) => SetOrdered(probeIsKeyed(cx) ? cx.valueSeq() : cx),
    toSet: (cx) => Set(probeIsKeyed(cx) ? cx.valueSeq() : cx),
    toIndexedSeq: collectionCastIndexedSeqCreate,
    toKeyedSeq: (cx) => collectionCastKeyedSeqCreate(cx, true),
    toMap: (cx) => Map(collectionCastKeyedSeqCreate(cx, true)),
    toList: (cx) => List(probeIsKeyed(cx) ? cx.valueSeq() : cx),
    toStack: (cx) => Stack(probeIsKeyed(cx) ? cx.valueSeq() : cx),
    entrySeq: collectionXOpEntrySeq,
    fromEntrySeq: collectionKeyedSeqFromEntriesCreate,
    countBy: collectionXOpCountBy,
    flatMap: collectionXOpFlatMap,
    groupBy: collectionXOpGroupBy,
    flatten: collectionXOpFlatten,
    valueSeq: (cx) => cx.toIndexedSeq(),
    take: collectionXOpTake,
    map: collectionXOpMap,
    sortBy: collectionXOpSortBy,
    sort: collectionXOpSort,
    concat: flagSpread(collectionXOpConcat),
    flip: collectionXOpFlip,
    filter: collectionXOpFilter,
    filterNot: collectionXOpFilterNot,
    partition: collectionXOpPartition,
    slice: collectionXOpSlice,
    takeLast: collectionXOpTakeLast,
    reverse: collectionXOpReverse,
    isSubset: collectionXOpIsSubset,
    isSuperset: collectionXOpIsSuperset,
    update: collectionXOrAnyOpUpdate,
    updateIn: collectionXOrAnyOpUpdateIn,
    setIn: collectionXOrAnyOpSetIn,
  })
);

Object.assign(
  collectionKeyedPropertiesCreate(),
  transformToMethods({
    flip: collectionXKeyedOpFlip,
    mapEntries: collectionXKeyedOpMapEntries,
    mapKeys: collectionXKeyedOpMapKeys,
  })
);

Object.assign(
  collectionCastKeyedSeqPropertiesCreate(),
  transformToMethods({
    reverse: collectionXCastKeyedSequenceOpReverse,
    map: collectionXCastKeyedSequenceOpMap,
  })
);

Object.assign(
  setOrderedPropertiesCreate(),
  transformToMethods({
    zip: flagSpread(collectionXIndexedOpZip),
    zipWith: flagSpread(collectionXIndexedOpZipWith),
    zipAll: flagSpread(collectionXIndexedOpZipAll),
  })
);

Object.assign(
  collectionIndexedPropertiesCreate(),
  transformToMethods({
    reverse: collectionXIndexedOpReverse,
    filter: collectionXIndexedOpFilter,
    slice: collectionXIndexedOpSlice,
    lastKeyOf: collectionXOpLastKeyOf,
    interpose: collectionXIndexedOpInterpose,
    zip: flagSpread(collectionXIndexedOpZip),
    zipWith: flagSpread(collectionXIndexedOpZipWith),
    zipAll: flagSpread(collectionXIndexedOpZipAll),
    interleave: flagSpread(collectionXIndexedOpInterleave),
    splice: flagSpread(collectionXIndexedOpSplice),
    toKeyedSeq: (cx) => collectionCastKeyedSeqCreate(cx, false),
    keySeq: (cx) => Range(0, cx.size),
  })
);

Object.assign(
  collectionRecordPropertiesCreate(),
  transformToMethods({
    mergeWith: flagSpread(collectionXOpMergeWith),
    merge: flagSpread(collectionXOpMerge),
    mergeIn: flagSpread(collectionXOpMergeIn),
    mergeDeep: flagSpread(collectionXOpMergeDeep),
    mergeDeepWith: flagSpread(collectionXOpMergeDeepWith),
    mergeDeepIn: flagSpread(collectionXOpMergeDeepIn),
    deleteIn: collectionXOrAnyOpRemoveIn,
    removeIn: collectionXOrAnyOpRemoveIn,
  })
);

Object.assign(
  listPropertiesCreate(),
  transformToMethods({
    deleteIn: collectionXOrAnyOpRemoveIn,
    removeIn: collectionXOrAnyOpRemoveIn,
  })
);

Object.assign(
  mapPropertiesCreate(),
  transformToMethods({
    mergeWith: flagSpread(collectionXOpMergeWith),
    merge: flagSpread(collectionXOpMerge),
    concat: flagSpread(collectionXOpMerge),
    mergeIn: flagSpread(collectionXOpMergeIn),
    mergeDeep: flagSpread(collectionXOpMergeDeep),
    mergeDeepWith: flagSpread(collectionXOpMergeDeepWith),
    mergeDeepIn: flagSpread(collectionXOpMergeDeepIn),
    deleteIn: collectionXOrAnyOpRemoveIn,
    removeIn: collectionXOrAnyOpRemoveIn,
  })
);

export { SeqWhenNotCollection as Collection };
