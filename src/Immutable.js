import { Stack } from './Stack';
import { PairSorting } from './PairSorting';
import { Record } from './Record';
import { Repeat } from './Repeat';
import { fromJS } from './fromJS';
import { Map } from './Map';
import { Seq } from './Seq';
import { SeqArray as ArraySeq } from './SeqArray';
import { SeqObject as ObjectSeq } from './SeqObject';
import { Set } from './Set';
import { SetOrdered as OrderedSet } from './SetOrdered';
import { List } from './List';
import { Range } from './Range';
import { MapOrdered as OrderedMap } from './MapOrdered';
import { Collection } from './Universe';

// Functional predicates
import {
  probeIsSame as is,
  probeIsPlainObject as isPlainObject,
  probeIsIndexed as isIndexed,
  probeIsValueObject as isValueObject,
  probeIsList as isList,
  probeIsSet as isSet,
  probeIsRecord as isRecord,
  probeIsImmutable as isImmutable,
  probeIsCollection as isCollection,
  probeIsAssociative as isAssociative,
  probeIsOrderedMap as isOrderedMap,
  probeIsOrdered as isOrdered,
  probeIsOrderedSet as isOrderedSet,
  probeIsKeyed as isKeyed,
  probeIsStack as isStack,
  probeIsSeq as isSeq,
  probeIsMap as isMap,
} from './probe';

import { hash } from './Hash';

// Functional read/write API
import {
  collectionOrAnyOpHas as has,
  collectionOrAnyOpHasIn as hasIn,
  collectionOrAnyOpRemove as remove,
  collectionOrAnyOpGet as get,
  collectionOrAnyOpGetIn as getIn,
  collectionOrAnyOpSet as set,
} from './collection/collection';

import {
  collectionXOrAnyOpUpdateIn as updateIn,
  collectionXOrAnyOpUpdate as update,
  collectionXOrAnyOpRemoveIn as removeIn,
  collectionXOrAnyOpSetIn as setIn,
  collectionXOpMergeWithSources,
  collectionXOpMergeDeep,
  collectionXOpMergeDeepWith,
  collectionXOpMergeWith,
} from './collection/collectionX';

// user-friendly interface mapped to internal interface
const merge = (cx, ...sources) => collectionXOpMergeWithSources(cx, sources);
const mergeDeep = (cx, ...sources) => collectionXOpMergeDeep(cx, sources);
const mergeWith = (merger, cx, ...sources) =>
  collectionXOpMergeWith(merger, cx, sources);
const mergeDeepWith = (merger, cx, ...sources) =>
  collectionXOpMergeDeepWith(cx, merger, sources);

import { version } from '../package.json';

// Note: Iterable is deprecated
const Iterable = Collection;

export {
  version,
  Collection,
  Iterable,
  ArraySeq,
  ObjectSeq,
  Seq,
  Map,
  OrderedMap,
  List,
  Stack,
  Set,
  OrderedSet,
  PairSorting,
  Record,
  Range,
  Repeat,
  is,
  fromJS,
  hash,
  isImmutable,
  isCollection,
  isKeyed,
  isIndexed,
  isAssociative,
  isOrdered,
  isPlainObject,
  isValueObject,
  isSeq,
  isList,
  isMap,
  isOrderedMap,
  isStack,
  isSet,
  isOrderedSet,
  isRecord,
  get,
  getIn,
  has,
  hasIn,
  merge,
  mergeDeep,
  mergeWith,
  mergeDeepWith,
  remove,
  removeIn,
  set,
  setIn,
  update,
  updateIn,
};
