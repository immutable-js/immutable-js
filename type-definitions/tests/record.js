/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// Some tests look like they are repeated in order to avoid false positives.
// Flow might not complain about an instance of (what it thinks is) T to be assigned to T<K, V>

import { Record, type RecordFactory, type RecordOf } from '../../';

// Use the RecordFactory type to annotate
const Point2: RecordFactory<{x: number, y: number}> = Record({x:0, y:0});
const Point3: RecordFactory<{x: number, y: number, z: number}> =
  Record({x:0, y:0, z:0});
type TGeoPoint = {lat: ?number, lon: ?number}
const GeoPoint: RecordFactory<TGeoPoint> = Record({lat: null, lon: null});

// $ExpectError - 'abc' is not a number
const PointWhoops: RecordFactory<{x: number, y: number}> = Record({x:0, y:'abc'});

let origin2 = Point2({});
let origin3 = Point3({});
let geo = GeoPoint({lat:34});
// $ExpectError
const mistake = Point2({x:'string'});
origin3 = GeoPoint({lat:34})
geo = Point3({});

// Use RecordOf to type the return value of a Record factory function.
let geoPointExpected1: RecordOf<TGeoPoint> = GeoPoint({});

// $ExpectError - Point2 does not return GeoPoint.
let geoPointExpected2: RecordOf<TGeoPoint> = Point2({});

const px = origin2.get('x');
const px2: number = origin2.x;
// $ExpectError
const pz = origin2.get('z');
// $ExpectError
const pz2 = origin2.z;

origin2.set('x', 4);
// $ExpectError
origin2.set('x', 'not-a-number');
// $ExpectError
origin2.set('z', 3);

const name: string = Record.getDescriptiveName(origin2);
// $ExpectError
const name: string = Record.getDescriptiveName({});

// Note: need to cast through any when extending Records as if they ere classes
class ABClass extends (Record({a:1, b:2}): any) {
  setA(a: number) {
    return this.set('a', a);
  }

  setB(b: number) {
    return this.set('b', b);
  }
}

var t1 = new ABClass({a: 1});
var t2 = t1.setA(3);
var t3 = t2.setB(10);
// Note: flow does not check extended Record classes yet
var t4 = t2.setC(10);

// Note: flow does not check extended Record classes yet
var t1a: string = t1.a;
// Note: flow does not check extended Record classes yet
var t1c = t1.c;

// Use of new to create record factories (supported, but discouraged)
const PointNew = new Record({x:0, y:0});
// Not using new allows returning a record.
const origin: RecordOf<{x:number, y:number}> = PointNew();
// Can use the Record constructor type as an alternative,
// it just doesn't support property access.
const originAlt1: PointNew = PointNew();
// Can also sort of use the inner Record values type as an alternative,
// however it does not have the immutable record API, though useful for flowing
// immutable Records where plain objects are expected.
const originAlt2: {x: number, y: number} = PointNew();
// Both get and prop access are supported with RecordOf
{ const x: number = origin.get('x') }
{ const x: number = origin.x }
// $ExpectError number is not a string
{ const x: string = origin.x }

// $ExpectError Use of new may only return a class instance, not a record
const mistakeOriginNew: RecordOf<{x: number, y: number}> = new PointNew();
// An alternative type strategy is instance based
const originNew: PointNew = new PointNew();
// Only get, but not prop access are supported with class instances
{ const x: number = originNew.get('x') }
// $ExpectError property `x`. Property not found in RecordInstance
{ const x: number = originNew.x }

// $ExpectError instantiated with invalid type
const mistakeNewRecord = PointNew({x: 'string'});
// $ExpectError instantiated with invalid type
const mistakeNewInstance = new PointNew({x: 'string'});
