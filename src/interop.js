/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  Iterable,
  Seq,
  Collection,
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
  fromJS
} from './Immutable'

// current build pipeline does not allow
//
//   import * as Immutable from './Immutable'
//   export default Immutable
//
// so instead we do this very explicit import and export

export default {

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
