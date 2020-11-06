/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {
  List,
  Map,
  Record,
  type RecordOf,
  type RecordFactory,
  get,
  getIn,
  has,
  hasIn,
  merge,
  mergeDeep,
  mergeWith,
  mergeDeepWith,
  remove,
  removeIn,
  set,
  setIn,
  update,
  updateIn,
} from '../../';

// merge: Objects as Maps

type ObjMap<T> = { [key: string]: T };
const objMap: ObjMap<number> = { x: 12, y: 34 };
(merge(objMap, { x: 321 }): ObjMap<number>);
(merge(objMap, { z: 321 }): ObjMap<number>);
// $ExpectError
(merge(objMap, { x: 'abc' }): ObjMap<number>);
(merge(objMap, [['x', 321]]): ObjMap<number>);
(merge(objMap, [['z', 321]]): ObjMap<number>);
// $ExpectError
(merge(objMap, [['x', 'abc']]): ObjMap<number>);
// $ExpectError
(merge(objMap, [321]): ObjMap<number>);
(merge(objMap, Map({ x: 123 })): ObjMap<number>);
(merge(objMap, Map({ z: 123 })): ObjMap<number>);
(merge(objMap, Map([['x', 123]])): ObjMap<number>);
(merge(objMap, Map([['z', 123]])): ObjMap<number>);
// $ExpectError
(merge(objMap, List([123])): ObjMap<number>);

// merge: Records

type XYPoint = { x: number, y: number };
type XYPointRecord = RecordOf<XYPoint>;
const xyRecord: RecordFactory<XYPoint> = Record({ x: 0, y: 0 });
const record = xyRecord();
(merge(record, { x: 321 }): XYPointRecord);
(merge(record, xyRecord({ x: 321 })): XYPointRecord);
// $ExpectError
(merge(record, { z: 321 }): XYPointRecord);
// $ExpectError
(merge(record, { x: 'abc' }): XYPointRecord);
(merge(record, [['x', 321]]): XYPointRecord);
// $ExpectError
(merge(record, [['z', 321]]): XYPointRecord);
// $ExpectError
(merge(record, [['x', 'abc']]): XYPointRecord);
// $ExpectError
(merge(record, [321]): XYPointRecord);
(merge(record, Map({ x: 123 })): XYPointRecord);
// $ExpectError
(merge(record, Map({ z: 123 })): XYPointRecord);
(merge(record, Map([['x', 123]])): XYPointRecord);
// $ExpectError
(merge(record, Map([['z', 123]])): XYPointRecord);
// $ExpectError
(merge(record, List([123])): XYPointRecord);

// merge: Maps

const map = Map({ key: 'value' });
(merge(map, { key: 'alternate' }): Map<string, string>);
(merge(map, { otherKey: 'value' }): Map<string, string>);
(merge(map, Map({ key: 'alternate' })): Map<string, string>);
(merge(map, Map({ otherKey: 'value' })): Map<string, string>);
(merge(map, [['otherKey', 'value']]): Map<string, string>);
// $ExpectError (functional merge cannot return union value types)
(merge(map, Map({ otherKey: 123 })): Map<string, string | number>);
// $ExpectError
(merge(map, [4, 5, 6]): Map<string, string>);
// $ExpectError
(merge(map, 123): Map<string, string>);
// $ExpectError
(merge(map, { 0: 123 }): Map<string, string>);
// $ExpectError
(merge(map, [
  [0, 4],
  [1, 5],
  [1, 6],
]): Map<string, string>);

// merge: Lists

const list = List([1, 2, 3]);
(merge(list, [4, 5, 6]): List<number>);
(merge(list, List([4, 5, 6])): List<number>);
// $ExpectError (functional merge cannot return union value types)
(merge(list, ['a', 'b', 'c']): List<number | string>);
// $ExpectError (functional merge cannot return union value types)
(merge(list, List(['a', 'b', 'c'])): List<number | string>);
// $ExpectError
(merge(list, 123): List<number>);
// $ExpectError
(merge(list, { 0: 123 }): List<number>);
// $ExpectError
(merge(list, Map({ 0: 123 })): List<number>);
// $ExpectError
(merge(list, [
  [0, 4],
  [1, 5],
  [1, 6],
]): List<number>);

// merge: Objects as Records

const objRecord: XYPoint = { x: 12, y: 34 };
(merge(objRecord, { x: 321 }): XYPoint);
(merge(objRecord, xyRecord({ x: 321 })): XYPoint);
// $ExpectError
(merge(objRecord, { z: 321 }): XYPoint);
// $ExpectError
(merge(objRecord, { x: 'abc' }): XYPoint);
(merge(objRecord, [['x', 321]]): XYPoint);
// $ExpectError
(merge(objRecord, [['z', 321]]): XYPoint);
// $ExpectError
(merge(objRecord, [['x', 'abc']]): XYPoint);
// $ExpectError
(merge(objRecord, [321]): XYPoint);
(merge(objRecord, Map({ x: 123 })): XYPoint);
// $ExpectError
(merge(objRecord, Map({ z: 123 })): XYPoint);
(merge(objRecord, Map([['x', 123]])): XYPoint);
// $ExpectError
(merge(objRecord, Map([['z', 123]])): XYPoint);
// $ExpectError
(merge(objRecord, List([123])): XYPoint);

// merge: Arrays

const arr = [1, 2, 3];
(merge(arr, [4, 5, 6]): Array<number>);
(merge(arr, List([4, 5, 6])): Array<number>);
// $ExpectError (functional merge cannot return union value types)
(merge(arr, ['a', 'b', 'c']): Array<number | string>);
// $ExpectError (functional merge cannot return union value types)
(merge(arr, List(['a', 'b', 'c'])): Array<number | string>);
// $ExpectError
(merge(arr, 123): Array<number>);
// $ExpectError
(merge(arr, { 0: 123 }): Array<number>);
// $ExpectError
(merge(arr, Map({ 0: 123 })): Array<number>);
// $ExpectError
(merge(arr, [
  [0, 4],
  [1, 5],
  [1, 6],
]): Array<number>);
