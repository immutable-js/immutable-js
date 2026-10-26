import {
  List,
  Map,
  MapOf,
  OrderedMap,
  OrderedSet,
  Set,
  Stack,
} from 'immutable';
import { expect, test } from 'tstyche';

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
  expect<List<B>>().type.toBeAssignableTo(List<A>());

  expect(List([new B()])).type.toBe<List<B>>();

  expect<List<B>>().type.not.toBeAssignableTo(List<C>());
});

test('Map covariance', () => {
  expect<Map<string, B>>().type.toBeAssignableTo<Map<string, A>>();

  expect(Map({ b: new B() })).type.toBe<MapOf<{ b: B }>>();

  expect<Map<string, B>>().type.not.toBeAssignableTo<Map<string, C>>();
});

test('MapOf invariance', () => {
  expect<MapOf<{ b: B }>>().type.toBeAssignableTo<Map<string, A>>();

  expect<MapOf<{ b: B }>>().type.not.toBeAssignableTo<MapOf<{ b: A }>>();

  expect(Map<{ b: A }>({ b: new B() })).type.toBe<MapOf<{ b: A }>>();

  expect(Map({ total: null })).type.not.toBeAssignableTo<
    MapOf<{ total: number | null }>
  >();

  expect(Map<{ total: number | null }>({ total: null })).type.toBe<
    MapOf<{ total: number | null }>
  >();
});

test('Set covariance', () => {
  expect<Set<B>>().type.toBeAssignableTo<Set<A>>();

  expect(Set([new B()])).type.toBe<Set<B>>();

  expect<Set<B>>().type.not.toBeAssignableTo<Set<C>>();
});

test('Stack covariance', () => {
  expect<Stack<B>>().type.toBeAssignableTo<Stack<A>>();

  expect(Stack([new B()])).type.toBe<Stack<B>>();

  expect<Stack<B>>().type.not.toBeAssignableTo<Stack<C>>();
});

test('OrderedMap covariance', () => {
  expect<OrderedMap<string, B>>().type.toBeAssignableTo<
    OrderedMap<string, A>
  >();

  expect(OrderedMap({ b: new B() })).type.toBe<OrderedMap<string, B>>();

  expect<OrderedMap<string, B>>().type.not.toBeAssignableTo<
    OrderedMap<string, C>
  >();
});

test('OrderedSet covariance', () => {
  expect<OrderedSet<B>>().type.toBeAssignableTo<OrderedSet<A>>();

  expect(OrderedSet([new B()])).type.toBe<OrderedSet<B>>();

  expect<OrderedSet<B>>().type.not.toBeAssignableTo<OrderedSet<C>>();
});
