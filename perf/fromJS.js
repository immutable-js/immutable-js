/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

describe('fromJS', () => {
  const list = Immutable.List();
  it('List', () => {
    Immutable.fromJS(list);
  });

  const object = { foo: 'bar' };
  it('object', () => {
    Immutable.fromJS(object);
  });
});
