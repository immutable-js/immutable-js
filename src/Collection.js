/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "mixin"
import "Iterable"
/* global mixin,
          Iterable, KeyedIterable, IndexedIterable, SetIterable */
/* exported Collection, KeyedCollection, IndexedCollection, SetCollection */


class Collection extends Iterable {
  constructor() {
    throw TypeError('Abstract');
  }
}

class KeyedCollection extends Collection {}
mixin(KeyedCollection, KeyedIterable.prototype);

class IndexedCollection extends Collection {}
mixin(IndexedCollection, IndexedIterable.prototype);

class SetCollection extends Collection {}
mixin(SetCollection, SetIterable.prototype);


Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
