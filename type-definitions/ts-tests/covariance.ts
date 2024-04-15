import { expect, test } from 'tstyche';
import {
  List,
  Map,
  MapOf,
  OrderedMap,
  OrderedSet,
  Set,
  Stack,
} from 'immutable';

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

test('List covariance', () => {
  expect<List<A>>().type.toBeAssignableWith(List<B>());

  expect(List([new B()])).type.toBe<List<B>>();

  expect<List<C>>().type.not.toBeAssignable(List<B>());
});

test('Map covariance', () => {
  expect<Map<string, A>>().type.toBeAssignableWith<Map<string, B>>();

  expect(Map({ b: new B() })).type.toBe<MapOf<{ b: B }>>();

  expect<Map<string, C>>().type.not.toBeAssignable<Map<string, B>>();
});

test('Set covariance', () => {
  expect<Set<A>>().type.toBeAssignableWith<Set<B>>();

  expect(Set([new B()])).type.toBe<Set<B>>();

  expect<Set<C>>().type.not.toBeAssignable<Set<B>>();
});

test('Stack covariance', () => {
  expect<Stack<A>>().type.toBeAssignableWith<Stack<B>>();

  expect(Stack([new B()])).type.toBe<Stack<B>>();

  expect<Stack<C>>().type.not.toBeAssignable<Stack<B>>();
});

test('OrderedMap covariance', () => {
  expect<OrderedMap<string, A>>().type.toBeAssignableWith<
    OrderedMap<string, B>
  >();

  expect(OrderedMap({ b: new B() })).type.toBe<OrderedMap<string, B>>();

  expect<OrderedMap<string, C>>().type.not.toBeAssignable<
    OrderedMap<string, B>
  >();
});

test('OrderedSet covariance', () => {
  expect<OrderedSet<A>>().type.toBeAssignableWith<OrderedSet<B>>();

  expect(OrderedSet([new B()])).type.toBe<OrderedSet<B>>();

  expect<OrderedSet<C>>().type.not.toBeAssignable<OrderedSet<B>>();
});
