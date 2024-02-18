import { expectAssignable, expectNotAssignable } from 'tsd';
import { List, Map, OrderedMap, OrderedSet, Set, Stack } from 'immutable';

class A {
  x: number;

  constructor() {
    this.x = 1;
  }
}
class B extends A {
  y: string;

  constructor() {
    super();
    this.y = 'B';
  }
}
class C {
  z: string;

  constructor() {
    this.z = 'C';
  }
}

// List covariance
declare let listOfB: List<B>;
expectAssignable<List<A>>(listOfB);
expectNotAssignable<List<C>>(listOfB);

// Map covariance
declare let mapOfB: Map<string, B>;
expectAssignable<Map<string, A>>(mapOfB);
expectNotAssignable<Map<string, C>>(mapOfB);

// Set covariance
declare let setOfB: Set<B>;
expectAssignable<Set<A>>(setOfB);
expectNotAssignable<Set<C>>(setOfB);

// Stack covariance
declare let stackOfB: Stack<B>;
expectAssignable<Stack<A>>(stackOfB);
expectNotAssignable<Stack<C>>(stackOfB);

// OrderedMap covariance
declare let orderedMapOfB: OrderedMap<string, B>;
expectAssignable<OrderedMap<string, A>>(orderedMapOfB);
expectNotAssignable<OrderedMap<string, C>>(orderedMapOfB);

// OrderedSet covariance
declare let orderedSetOfB: OrderedSet<B>;
expectAssignable<OrderedSet<A>>(orderedSetOfB);
expectNotAssignable<OrderedSet<C>>(orderedSetOfB);
