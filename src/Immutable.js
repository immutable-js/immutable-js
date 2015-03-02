/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Seq } from './Seq'
import { Collection } from './Collection'
import { OrderedMap, OrderedMapClass } from './OrderedMap'
import { List, ListClass } from './List'
import { Map, MapClass } from './Map'
import { Stack, StackClass } from './Stack'
import { OrderedSet, OrderedSetClass } from './OrderedSet'
import { Set, SetClass } from './Set'
import { Record } from './Record'
import { Range } from './Range'
import { Repeat } from './Repeat'
import { is } from './is'
import { fromJS } from './fromJS'
import { Iterable } from './IterableImpl'
import { createFactory } from './createFactory'

export default {

  Iterable,

  Seq,
  Collection,
  
  Map,
  MapClass,
  OrderedMap,
  OrderedMapClass,
  List,
  ListClass,
  Stack,
  StackClass,
  Set,
  SetClass,
  OrderedSet,
  OrderedSetClass,

  Record,
  Range,
  Repeat,

  is,
  fromJS,
  createFactory,

};
