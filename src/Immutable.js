import { Seq } from './Seq';
import { OrderedMap } from './OrderedMap';
import { SortedMap } from './SortedMap';
import { List } from './List';
import { Map } from './Map';
import { Stack } from './Stack';
import { OrderedSet } from './OrderedSet';
import { PairSorting } from './PairSorting';
import { Set } from './Set';
import { SortedSet } from './SortedSet';
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
import { isSorted } from './predicates/isSorted';
import { isValueObject } from './predicates/isValueObject';
import { isSeq } from './predicates/isSeq';
import { isList } from './predicates/isList';
import { isMap } from './predicates/isMap';
import { isOrderedMap } from './predicates/isOrderedMap';
import { isSortedMap } from './predicates/isSortedMap';
import { isStack } from './predicates/isStack';
import { isSet } from './predicates/isSet';
import { isOrderedSet } from './predicates/isOrderedSet';
import { isSortedSet } from './predicates/isSortedSet';
import { isRecord } from './predicates/isRecord';

import { Collection } from './CollectionImpl';
import { hash } from './Hash';

// Functional read/write API
import { get } from './functional/get';
import { getIn } from './functional/getIn';
import { has } from './functional/has';
import { hasIn } from './functional/hasIn';
import { merge, mergeDeep, mergeWith, mergeDeepWith } from './functional/merge';
import { remove } from './functional/remove';
import { removeIn } from './functional/removeIn';
import { set } from './functional/set';
import { setIn } from './functional/setIn';
import { update } from './functional/update';
import { updateIn } from './functional/updateIn';

import { version } from '../package.json';

export default {
  version: version,

  Collection: Collection,
  // Note: Iterable is deprecated
  Iterable: Collection,

  Seq: Seq,
  Map: Map,
  OrderedMap: OrderedMap,
  SortedMap: SortedMap,
  List: List,
  Stack: Stack,
  Set: Set,
  OrderedSet: OrderedSet,
  SortedSet: SortedSet,
  PairSorting: PairSorting,

  Record: Record,
  Range: Range,
  Repeat: Repeat,

  is: is,
  fromJS: fromJS,
  hash: hash,

  isImmutable: isImmutable,
  isCollection: isCollection,
  isKeyed: isKeyed,
  isIndexed: isIndexed,
  isAssociative: isAssociative,
  isOrdered: isOrdered,
  isSorted: isSorted,
  isValueObject: isValueObject,
  isPlainObject: isPlainObject,
  isSeq: isSeq,
  isList: isList,
  isMap: isMap,
  isOrderedMap: isOrderedMap,
  isSortedMap: isSortedMap,
  isStack: isStack,
  isSet: isSet,
  isOrderedSet: isOrderedSet,
  isSortedSet: isSortedSet,
  isRecord: isRecord,

  get: get,
  getIn: getIn,
  has: has,
  hasIn: hasIn,
  merge: merge,
  mergeDeep: mergeDeep,
  mergeWith: mergeWith,
  mergeDeepWith: mergeDeepWith,
  remove: remove,
  removeIn: removeIn,
  set: set,
  setIn: setIn,
  update: update,
  updateIn: updateIn,
};

// Note: Iterable is deprecated
const Iterable = Collection;

export {
  version,
  Collection,
  Iterable,
  Seq,
  Map,
  OrderedMap,
  SortedMap,
  List,
  Stack,
  Set,
  OrderedSet,
  SortedSet,
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
  isSorted,
  isPlainObject,
  isValueObject,
  isSeq,
  isList,
  isMap,
  isOrderedMap,
  isSortedMap,
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
