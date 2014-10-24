/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "Map"
import "Vector"
import "Stack"
import "Set"
import "OrderedMap"
import "Record"
import "Range"
import "Repeat"
import "is"
import "fromJS"
import "Cursor" // Solve circular dependency
/* global Sequence, LazySequence,
          Map, Vector, Stack, Set, OrderedMap, Record, Range, Repeat,
          is, fromJS */
/* exported Immutable */


var Immutable = {

  Sequence: Sequence,

  LazySequence: LazySequence,

  Map: Map,
  Vector: Vector,
  Stack: Stack,
  Set: Set,
  OrderedMap: OrderedMap,

  Record: Record,
  Range: Range,
  Repeat: Repeat,

  is: is,
  fromJS: fromJS,
};
