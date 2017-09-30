/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Seq } from './Seq';
import { OrderedMap } from './OrderedMap';
import { List } from './List';
import { Map } from './Map';
import { Stack } from './Stack';
import { OrderedSet } from './OrderedSet';
import { Set } from './Set';
import { Record } from './Record';
import { Range } from './Range';
import { Repeat } from './Repeat';
import { is } from './is';
import { fromJS } from './fromJS';
import {
  isImmutable,
  isCollection,
  isKeyed,
  isIndexed,
  isAssociative,
  isOrdered,
  isValueObject
} from './Predicates';
import { Collection } from './CollectionImpl';
import { hash } from './Hash';

export default {
  Collection: Collection,
  // Note: Iterable is deprecated
  Iterable: Collection,

  Seq: Seq,
  Map: Map,
  OrderedMap: OrderedMap,
  List: List,
  Stack: Stack,
  Set: Set,
  OrderedSet: OrderedSet,

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
  isValueObject: isValueObject
};

// Note: Iterable is deprecated
const Iterable = Collection;

export {
  Collection,
  Iterable,
  Seq,
  Map,
  OrderedMap,
  List,
  Stack,
  Set,
  OrderedSet,
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
  isValueObject
};
