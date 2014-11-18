/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Iterable"
import "Seq"
import "Operations" // Break circular dependency
import "Map"
import "OrderedMap"
import "List"
import "Stack"
import "Set"
import "OrderedSet"
import "Record"
import "Range"
import "Repeat"
import "is"
import "fromJS"
/* global Iterable, Seq, Collection,
          Map, OrderedMap, List, Stack, Set, OrderedSet, Record, Range, Repeat,
          is, fromJS */
/* exported Immutable */


var Immutable = {

  Iterable: Iterable,

  Seq: Seq,
  Collection: Collection,
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
};
