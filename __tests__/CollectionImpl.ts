/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { fromJS, Map } from '../';

describe('CollectionImpl', () => {
  it('should allow getIn past null values', () => {
    console.warn = jest.genMockFunction();

    const m = Map({a: { b: null }});

    expect(m.getIn(['a', 'b', 'c', 'd'], 'notSetValue')).toBe('notSetValue');
    expect(console.warn.mock.calls.length).toBe(0);
  });

  it('should allow hasIn past null values', () => {
    console.warn = jest.genMockFunction();

    const m = Map({a: { b: null }});

    expect(m.hasIn(['a', 'b', 'c', 'd'])).toBeFalsy();
    expect(console.warn.mock.calls.length).toBe(0);
  });
});
