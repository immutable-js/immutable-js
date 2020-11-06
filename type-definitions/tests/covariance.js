/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { List, Map, Set, Stack, OrderedMap, OrderedSet } from '../../';

class A {
  x: number;
}
class B extends A {
  y: string;
}
class C {
  z: string;
}

// List covariance
declare var listOfB: List<B>;
var listOfA: List<A> = listOfB;
listOfA = List([new B()]);
// $ExpectError
var listOfC: List<C> = listOfB;

// Map covariance
declare var mapOfB: Map<string, B>;
var mapOfA: Map<string, A> = mapOfB;
mapOfA = Map({ b: new B() });
// $ExpectError
var mapOfC: Map<string, C> = mapOfB;

// Set covariance
declare var setOfB: Set<B>;
var setOfA: Set<A> = setOfB;
setOfA = Set([new B()]);
// $ExpectError
var setOfC: Set<C> = setOfB;

// Stack covariance
declare var stackOfB: Stack<B>;
var stackOfA: Stack<A> = stackOfB;
stackOfA = Stack([new B()]);
// $ExpectError
var stackOfC: Stack<C> = stackOfB;

// OrderedMap covariance
declare var orderedMapOfB: OrderedMap<string, B>;
var orderedMapOfA: OrderedMap<string, A> = orderedMapOfB;
orderedMapOfA = OrderedMap({ b: new B() });
// $ExpectError
var orderedMapOfC: OrderedMap<string, C> = orderedMapOfB;

// OrderedSet covariance
declare var orderedSetOfB: OrderedSet<B>;
var orderedSetOfA: OrderedSet<A> = orderedSetOfB;
orderedSetOfA = OrderedSet([new B()]);
// $ExpectError
var orderedSetOfC: OrderedSet<C> = orderedSetOfB;
