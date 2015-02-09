/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { Iterable } from './Iterable'


export class Collection extends Iterable {
  constructor() {
    throw TypeError('Abstract');
  }
}

export class KeyedCollection extends Collection {}

export class IndexedCollection extends Collection {}

export class SetCollection extends Collection {}


Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
