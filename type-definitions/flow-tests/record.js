// @flow
// Some tests look like they are repeated in order to avoid false positives.
// Flow might not complain about an instance of (what it thinks is) T to be assigned to T<K, V>

import { Record, type RecordFactory, type RecordOf, Map, List, merge } from 'immutable';

// Use the RecordFactory type to annotate
const Point2: RecordFactory<{ x: number, y: number }> = Record({ x: 0, y: 0 });
const Point3: RecordFactory<{ x: number, y: number, z: number }> = Record({
  x: 0,
  y: 0,
  z: 0,
});
type TGeoPoint = { lat: ?number, lon: ?number };
const GeoPoint: RecordFactory<TGeoPoint> = Record({ lat: null, lon: null });

const PointWhoops: RecordFactory<{ x: number, y: number }> = Record({
  x: 0,
  // $FlowExpectedError[incompatible-type-arg]
  y: 'abc',
});

let origin2 = Point2({});
let origin3 = Point3({});
let geo = GeoPoint({ lat: 34 });
// $FlowExpectedError[incompatible-call]
const mistake = Point2({ x: 'string' });
origin3 = GeoPoint({ lat: 34 });
geo = Point3({});

// Use RecordOf to type the return value of a Record factory function.
let geoPointExpected1: RecordOf<TGeoPoint> = GeoPoint({});

// $FlowExpectedError[prop-missing] - Point2 does not return GeoPoint.
let geoPointExpected2: RecordOf<TGeoPoint> = Point2({});

const px = origin2.get('x');
const px2: number = origin2.x;
// $FlowExpectedError[incompatible-type]
const px3: number = origin2.get('x', 'not set value');
const px4: number | string = origin2.get('x', 'not set value');
// $FlowExpectedError[incompatible-call]
const pz = origin2.get('z');
// $FlowExpectedError[incompatible-use]
const pz2 = origin2.z;

origin2.set('x', 4);
// $FlowExpectedError[incompatible-call]
origin2.set('x', 'not-a-number');
// $FlowExpectedError[incompatible-call]
origin2.set('z', 3);

const name: string = Record.getDescriptiveName(origin2);
// $FlowExpectedError[incompatible-call]
const name2: string = Record.getDescriptiveName({});

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
  // $FlowExpectedError[incompatible-type] number is not a string
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
  // $FlowExpectedError[prop-missing] cannot use property access for this alternative annotation
  const x: number = originAlt1.x;
}
// Can also sort of use the inner Record values type as an alternative,
// however it does not have the immutable record API, though useful for flowing
// immutable Records where plain objects are expected.
// Remember that Records are *read only*, and using the $ReadOnly helper type
// can ensure correct types.
const originAlt2: $ReadOnly<TPointNew> = MakePointNew();
{
  // $FlowExpectedError[prop-missing] cannot use Record API for this alternative annotation
  const x: number = originAlt2.get('x');
}
{
  const x: number = originAlt2.x;
}

// Use of new may only return a class instance, not a record
// (supported but discouraged)
// $FlowExpectedError[class-object-subtyping]
// $FlowExpectedError[prop-missing]
const mistakeOriginNew: PointNew = new MakePointNew();
// An alternative type strategy is instance based
const originNew: MakePointNew = new MakePointNew();
// Only get, but not prop access are supported with class instances
{
  const x: number = originNew.get('x');
}
{
  // $FlowExpectedError[prop-missing] property `x`. Property not found in RecordInstance
  const x: number = originNew.x;
}

// $FlowExpectedError[incompatible-call] instantiated with invalid type
const mistakeNewRecord = MakePointNew({ x: 'string' });
// $FlowExpectedError[incompatible-call] instantiated with invalid type
const mistakeNewInstance = new MakePointNew({ x: 'string' });

// Subclassing

// Note use of + for Read Only.
type TPerson = { +name: string, +age: number };
const defaultValues: TPerson = { name: 'Aristotle', age: 2400 };
const PersonRecord = Record<TPerson>(defaultValues);

class Person extends PersonRecord {
  getName(): string {
    return this.get('name');
  }

  setName(name: string): this & TPerson {
    // $FlowIssue[incompatible-return]
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
// $FlowExpectedError[incompatible-call]
person.get('unknown');
// $FlowExpectedError[prop-missing]
person.set('unknown', 'Thales');


// Functional Merge

type XYPoint = { x: number, y: number };
type XYPointRecord = RecordOf<XYPoint>;
const xyRecord: RecordFactory<XYPoint> = Record({ x: 0, y: 0 });
const record = xyRecord();
(merge(record, { x: 321 }): XYPointRecord);
(merge(record, xyRecord({ x: 321 })): XYPointRecord);
// $FlowExpectedError[incompatible-call]
(merge(record, { z: 321 }): XYPointRecord);
// $FlowExpectedError[incompatible-call]
(merge(record, { x: 'abc' }): XYPointRecord);
(merge(record, [['x', 321]]): XYPointRecord);
// $FlowExpectedError[prop-missing]]
(merge(record, [['z', 321]]): XYPointRecord);
// $FlowExpectedError[incompatible-call]
(merge(record, [['x', 'abc']]): XYPointRecord);
// $FlowExpectedError[incompatible-call]
(merge(record, [321]): XYPointRecord);
(merge(record, Map({ x: 123 })): XYPointRecord);
// $FlowExpectedError[incompatible-call]
(merge(record, Map({ z: 123 })): XYPointRecord);
(merge(record, Map([['x', 123]])): XYPointRecord);
// $FlowExpectedError[incompatible-call]
(merge(record, Map([['z', 123]])): XYPointRecord);
// $FlowExpectedError[incompatible-call]
(merge(record, List([123])): XYPointRecord);


// Type inference (issue #1722)

type Product = { address: string };
type App = { name: string };
const AppDefaults: App = { name: '' };

const AppRecordImplicit = Record(AppDefaults);
const AppRecordExplicit = Record<App>({ name: '' });
// $FlowExpectedError[prop-missing]
const AppRecordBorked: RecordFactory<App> = Record<Product>({ address: '' });

const appImplicit = AppRecordImplicit({ name: 'i' });
(appImplicit.get('name'): string);
(appImplicit.name: string);
// $FlowExpectedError[incompatible-call]
appImplicit.get('address');
// $FlowExpectedError[incompatible-use]
appImplicit.address;

const appExplicit = AppRecordExplicit({ name: 'e' });
(appExplicit.get('name'): string);
(appExplicit.name: string);
// $FlowExpectedError[incompatible-call]
appExplicit.get('address');
// $FlowExpectedError[incompatible-use]
appExplicit.address;
