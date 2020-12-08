/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

// tslint:disable-next-line:no-var-requires
const vm = require('vm');

import { Iterable, fromJS } from '../';

describe('fromJS', () => {
  it('is iterable outside of a vm', () => {
    expect(Iterable.isIterable(fromJS({}))).toBe(true);
  });

  it('is iterable inside of a vm', () => {
    vm.runInNewContext(
      `
    expect(Iterable.isIterable(fromJS({}))).toBe(true);
  `,
      {
        expect,
        Iterable,
        fromJS,
      },
      {}
    );
  });
});
