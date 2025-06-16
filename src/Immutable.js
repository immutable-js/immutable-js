/* eslint-disable import/order */
import { Seq } from './Seq';
import { OrderedMap } from './OrderedMap';
import { List } from './List';
import { Map } from './Map';
import { Stack } from './Stack';
import { OrderedSet } from './OrderedSet';
import { PairSorting } from './PairSorting';
import { Set } from './Set';
import { Record } from './Record';
import { Range } from './Range';
import { Repeat } from './Repeat';
import { is } from './is';
import { fromJS } from './fromJS';

import isPlainObject from './utils/isPlainObj';

// Functional predicates
import { isImmutable } from './predicates/isImmutable';
import { isCollection } from './predicates/isCollection';
import { isKeyed } from './predicates/isKeyed';
import { isIndexed } from './predicates/isIndexed';
import { isAssociative } from './predicates/isAssociative';
import { isOrdered } from './predicates/isOrdered';
import { isValueObject } from './predicates/isValueObject';
import { isSeq } from './predicates/isSeq';
import { isList } from './predicates/isList';
import { isMap } from './predicates/isMap';
import { isOrderedMap } from './predicates/isOrderedMap';
import { isStack } from './predicates/isStack';
import { isSet } from './predicates/isSet';
import { isOrderedSet } from './predicates/isOrderedSet';
import { isRecord } from './predicates/isRecord';

import { Collection } from './Universe';
import { hash } from './Hash';

// Functional read/write API
import {
  collectionOrAnyOpGet as get,
  collectionOrAnyOpGetIn as getIn,
  collectionOrAnyOpHas as has,
  collectionOrAnyOpHasIn as hasIn,
  collectionOrAnyOpRemove as remove,
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

import { SeqArray as ArraySeq } from './SeqArray';
import { SeqObject as ObjectSeq } from './SeqObject';

import { version } from '../package.json';

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
