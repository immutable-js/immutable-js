import { expectNotAssignable } from 'tsd';
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
let listOfB: List<B> = List<B>();
let listOfA: List<A> = listOfB;

// $ExpectType List<B>
listOfA = List([new B()]);

expectNotAssignable<List<C>>(listOfB);

// Map covariance
declare let mapOfB: Map<string, B>;
let mapOfA: Map<string, A> = mapOfB;

// $ExpectType MapOf<{ b: B; }>
mapOfA = Map({ b: new B() });

expectNotAssignable<Map<string, C>>(mapOfB);

// Set covariance
declare let setOfB: Set<B>;
let setOfA: Set<A> = setOfB;

// $ExpectType Set<B>
setOfA = Set([new B()]);
expectNotAssignable<Set<C>>(setOfB);

// Stack covariance
declare let stackOfB: Stack<B>;
let stackOfA: Stack<A> = stackOfB;
// $ExpectType Stack<B>
stackOfA = Stack([new B()]);
expectNotAssignable<Stack<C>>(stackOfB);

// OrderedMap covariance
declare let orderedMapOfB: OrderedMap<string, B>;
let orderedMapOfA: OrderedMap<string, A> = orderedMapOfB;
// $ExpectType OrderedMap<string, B>
orderedMapOfA = OrderedMap({ b: new B() });
expectNotAssignable<OrderedMap<string, C>>(orderedMapOfB);

// OrderedSet covariance
declare let orderedSetOfB: OrderedSet<B>;
let orderedSetOfA: OrderedSet<A> = orderedSetOfB;
// $ExpectType OrderedSet<B>
orderedSetOfA = OrderedSet([new B()]);
expectNotAssignable<OrderedSet<C>>(orderedSetOfB);
