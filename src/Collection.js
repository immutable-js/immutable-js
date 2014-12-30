/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Iterable } from './Iterable'
export { Collection, KeyedCollection, IndexedCollection, SetCollection }


class Collection extends Iterable {
  constructor() {
    throw TypeError('Abstract');
  }
}

class KeyedCollection extends Collection {}

class IndexedCollection extends Collection {}

class SetCollection extends Collection {}


Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
