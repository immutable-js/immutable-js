/*
 * @flow
 */

// Some tests look like they are repeated in order to avoid false positives.
// Flow might not complain about an instance of (what it thinks is) T to be assigned to T<K, V>

import { Record } from '../../';

const Point2 = Record({x:0, y:0});
const Point3 = Record({x:0, y:0, z:0});
const PointNew = new Record({x:0, y:0});
const GeoPoint = Record({lat:(null: ?number), lon:(null: ?number)});

let origin2 = Point2({});
let origin3 = Point3({});
let originNew = new PointNew();
let geo = GeoPoint({lat:34});
// $ExpectError
const mistake = Point2({x:'string'});
origin3 = GeoPoint({lat:34})
geo = Point3({});

const px = origin2.get('x');
const px2 = origin2.x;
// $ExpectError
const pz = origin2.get('z');
// $ExpectError
const pz2 = origin2.z;

origin2.set('x', 4);
// Note: this should be an error, but Flow does not yet support index types.
origin2.set('x', 'string');
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

var t1a = t1.a;
// Note: flow does not check extended Record classes yet
var t1a: string = t1.a;
// Note: flow does not check extended Record classes yet
var t1c = t1.c;
