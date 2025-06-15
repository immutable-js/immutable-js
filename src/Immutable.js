import { version } from '../package.json';
import { hash } from './Hash';
import { List } from './List';
import { Map } from './Map';
import { MapOrdered as OrderedMap } from './MapOrdered';
import { PairSorting } from './PairSorting';
import { Range } from './Range';
import { Record } from './Record';
import { Repeat } from './Repeat';
import { Seq } from './Seq';
import { SeqArray as ArraySeq } from './SeqArray';
import { SeqObject as ObjectSeq } from './SeqObject';
import { Set } from './Set';
import { SetOrdered as OrderedSet } from './SetOrdered';
import { Stack } from './Stack';
import { Collection } from './Universe';
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
import { fromJS } from './fromJS';

// Functional predicates
import { is } from './is';
import { isAssociative } from './predicates/isAssociative';
import { isCollection } from './predicates/isCollection';
import { isImmutable } from './predicates/isImmutable';
import { isIndexed } from './predicates/isIndexed';
import { isKeyed } from './predicates/isKeyed';
import { isList } from './predicates/isList';
import { isMap } from './predicates/isMap';
import { isOrdered } from './predicates/isOrdered';
import { isOrderedMap } from './predicates/isOrderedMap';
import { isOrderedSet } from './predicates/isOrderedSet';
import { isRecord } from './predicates/isRecord';
import { isSeq } from './predicates/isSeq';
import { isSet } from './predicates/isSet';
import { isStack } from './predicates/isStack';
import { isValueObject } from './predicates/isValueObject';
import isPlainObject from './utils/isPlainObj';

// user-friendly interface mapped to internal interface
const merge = (cx, ...sources) => collectionXOpMergeWithSources(cx, sources);
const mergeDeep = (cx, ...sources) => collectionXOpMergeDeep(cx, sources);
const mergeWith = (merger, cx, ...sources) =>
  collectionXOpMergeWith(merger, cx, sources);
const mergeDeepWith = (merger, cx, ...sources) =>
  collectionXOpMergeDeepWith(cx, merger, sources);

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
