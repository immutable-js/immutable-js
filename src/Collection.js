/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
