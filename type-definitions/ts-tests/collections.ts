/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Collection } from '../../';

{ // #constructor

  // $ExpectType Indexed<number>
  Collection([ 1, 2, 3 ]);

  // $ExpectType Indexed<[number, string]>
  Collection<[number, string]>([[1, 'number']]);
}
