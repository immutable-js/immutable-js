// TypeScript Version: 2.2.1

import {Record} from '../../../';

// let Point2 = Record<{ x: number, y: number }>({x: 0, y: 0});
// let Point3 = Record<{ x: number, y: number, z: number }>({x: 0, y: 0, z: 0});
// let GeoPoint = Record<{ lat: number | null, lon: number | null }>({lat: null, lon: null});
//
// Point2; // $ExpectType typeof Class<{ x: number; y: number; }>
// Point3; // $ExpectType typeof Class<{ x: number; y: number; z: number; }>
//
// let origin2 = Point2({});
// let origin3 = Point3({});
// let geo = GeoPoint({lat: 34});
// // $ExpectError
// let mistake = Point2({x: 'string'});
//
// origin3 = GeoPoint({lat: 34});
// geo = Point3({});
//
// origin2.get('x'); // $ExpectType any
// origin2.x; // $ExpectType any
// // $ExpectError
// let pz = origin2.get('z');
// // $ExpectError
// let pz2 = origin2.z;
//
// origin2.set('x', 4);
// // Note: this should be an error, but Flow does not yet support index types.
// origin2.set('x', 'string');
// // $ExpectError
// origin2.set('z', 3);
//
// let name1: string = Record.getDescriptiveName(origin2);
// // $ExpectError
// let name2: string = Record.getDescriptiveName({});
//
// // Note: need to cast through any when extending Records as if they ere classes
// class ABClass extends Record({a: 1, b: 2}) {
//     setA(a: number) {
//         return this.set('a', a);
//     }
//
//     setB(b: number) {
//         return this.set('b', b);
//     }
// }
//
// let t1 = new ABClass({a: 1});
// let t2 = t1.setA(3);
// let t3 = t2.setB(10);
// // Note: flow does not check extended Record classes yet
// let t4 = t2.setC(10);
//
// let t1a = t1.a;
// // Note: flow does not check extended Record classes yet
// let t1a: string = t1.a;
// // Note: flow does not check extended Record classes yet
// let t1c = t1.c;
