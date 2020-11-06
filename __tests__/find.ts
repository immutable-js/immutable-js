/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { List, Range, Seq } from '../';

describe('find', () => {
  it('find returns notSetValue when match is not found', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6]).find(
        function () {
          return false;
        },
        null,
        9
      )
    ).toEqual(9);
  });

  it('findEntry returns notSetValue when match is not found', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6]).findEntry(
        function () {
          return false;
        },
        null,
        9
      )
    ).toEqual(9);
  });

  it('findLastEntry returns notSetValue when match is not found', () => {
    expect(
      Seq([1, 2, 3, 4, 5, 6]).findLastEntry(
        function () {
          return false;
        },
        null,
        9
      )
    ).toEqual(9);
  });
});
