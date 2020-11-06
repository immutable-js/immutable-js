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
const Point2: RecordFactory<{ x: number, y: number }> = Record({ x: 0, y: 0 });
const Point3: RecordFactory<{ x: number, y: number, z: number }> = Record({
  x: 0,
  y: 0,
  z: 0,
});
type TGeoPoint = { lat: ?number, lon: ?number };
const GeoPoint: RecordFactory<TGeoPoint> = Record({ lat: null, lon: null });

// TODO: this should be ExpectError - 'abc' is not a number
// However, due to support for the brittle support for subclassing, Flow
// cannot also type check default values in this position.
const PointWhoops: RecordFactory<{ x: number, y: number }> = Record({
  x: 0,
  y: 'abc',
});

let origin2 = Point2({});
let origin3 = Point3({});
let geo = GeoPoint({ lat: 34 });
// $ExpectError
const mistake = Point2({ x: 'string' });
origin3 = GeoPoint({ lat: 34 });
geo = Point3({});

// Use RecordOf to type the return value of a Record factory function.
let geoPointExpected1: RecordOf<TGeoPoint> = GeoPoint({});

// $ExpectError - Point2 does not return GeoPoint.
let geoPointExpected2: RecordOf<TGeoPoint> = Point2({});

const px = origin2.get('x');
const px2: number = origin2.x;
// $ExpectError
const px3: number = origin2.get('x', 'not set value');
const px4: number | string = origin2.get('x', 'not set value');
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
class ABClass extends (Record({ a: 1, b: 2 }): any) {
  setA(a: number) {
    return this.set('a', a);
  }

  setB(b: number) {
    return this.set('b', b);
  }
}

var t1 = new ABClass({ a: 1 });
var t2 = t1.setA(3);
var t3 = t2.setB(10);
// Note: flow does not check extended Record classes yet
var t4 = t2.setC(10);

// Note: flow does not check extended Record classes yet
var t1a: string = t1.a;
// Note: flow does not check extended Record classes yet
var t1c = t1.c;

// Use of new to create record factories (supported, but discouraged)
type TPointNew = { x: number, y: number };
type PointNew = RecordOf<TPointNew>;
const MakePointNew: RecordFactory<TPointNew> = new Record({ x: 0, y: 0 });
// Not using new allows returning a record.
const origin: PointNew = MakePointNew();
// Both get and prop access are supported with RecordOf
{
  const x: number = origin.get('x');
}
{
  const x: number = origin.x;
}
{
  // $ExpectError number is not a string
  const x: string = origin.x;
}
// Can use the Record constructor type as an alternative,
// it just doesn't support property access.
const originAlt1: MakePointNew = MakePointNew();
// Both get and prop access are supported with RecordOf
{
  const x: number = originAlt1.get('x');
}
{
  // $ExpectError cannot use property access for this alternative annotation
  const x: number = originAlt1.x;
}
// Can also sort of use the inner Record values type as an alternative,
// however it does not have the immutable record API, though useful for flowing
// immutable Records where plain objects are expected.
// Remember that Records are *read only*, and using the $ReadOnly helper type
// can ensure correct types.
const originAlt2: $ReadOnly<TPointNew> = MakePointNew();
{
  // $ExpectError cannot use Record API for this alternative annotation
  const x: number = originAlt2.get('x');
}
{
  const x: number = originAlt2.x;
}

// Use of new may only return a class instance, not a record
// (supported but discouraged)
// $ExpectError
const mistakeOriginNew: PointNew = new MakePointNew();
// An alternative type strategy is instance based
const originNew: MakePointNew = new MakePointNew();
// Only get, but not prop access are supported with class instances
{
  const x: number = originNew.get('x');
}
{
  // $ExpectError property `x`. Property not found in RecordInstance
  const x: number = originNew.x;
}

// $ExpectError instantiated with invalid type
const mistakeNewRecord = MakePointNew({ x: 'string' });
// $ExpectError instantiated with invalid type
const mistakeNewInstance = new MakePointNew({ x: 'string' });

// Subclassing

// Note use of + for Read Only.
type TPerson = { +name: string, +age: number };
const defaultValues: TPerson = { name: 'Aristotle', age: 2400 };
const PersonRecord = Record(defaultValues);

class Person extends PersonRecord<TPerson> {
  getName(): string {
    return this.get('name');
  }

  setName(name: string): this & TPerson {
    return this.set('name', name);
  }
}

const person = new Person();
(person.setName('Thales'): Person);
(person.getName(): string);
(person.setName('Thales').getName(): string);
(person.setName('Thales').name: string);
person.get('name');
person.set('name', 'Thales');
// $ExpectError
person.get('unknown');
// $ExpectError
person.set('unknown', 'Thales');

// Note: not <TPerson>
class PersonWithoutTypes extends PersonRecord {
  getName(): string {
    return this.get('name');
  }

  setName(name: string): this & TPerson {
    return this.set('name', name);
  }
}

const person2 = new PersonWithoutTypes();

person2.get('name');
// Note: no error
person2.get('unknown');
