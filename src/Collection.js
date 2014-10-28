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
          Iterable, KeyedIterable, SetIterable, IndexedIterable */
/* exported Collection, KeyedCollection, SetCollection, IndexedCollection */


class Collection extends Iterable {
  constructor() {
    throw TypeError('Abstract');
  }
}

class KeyedCollection extends Collection {}
mixin(KeyedCollection, KeyedIterable.prototype);

class SetCollection extends Collection {}
mixin(SetCollection, SetIterable.prototype);

class IndexedCollection extends Collection {}
mixin(IndexedCollection, IndexedIterable.prototype);


Collection.Keyed = KeyedCollection;
Collection.Set = SetCollection;
Collection.Indexed = IndexedCollection;
