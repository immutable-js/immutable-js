// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import { List, Map, OrderedMap, OrderedSet, Set, Stack } from 'immutable';
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

test.skip('List covariance', () => {
  expect<List<B>>().type.toBeAssignableTo(List<A>());

  expect(List([new B()])).type.toBe<List<B>>();

  expect<List<B>>().type.not.toBeAssignableTo(List<C>());
});

test.skip('Map covariance', () => {
  expect<Map<string, B>>().type.toBeAssignableTo<Map<string, A>>();

  expect(Map({ b: new B() })).type.toBe<MapOf<{ b: B }>>();

  expect<Map<string, B>>().type.not.toBeAssignableTo<Map<string, C>>();
});

test.skip('Set covariance', () => {
  expect<Set<B>>().type.toBeAssignableTo<Set<A>>();

  expect(Set([new B()])).type.toBe<Set<B>>();

  expect<Set<B>>().type.not.toBeAssignableTo<Set<C>>();
});

test.skip('Stack covariance', () => {
  expect<Stack<B>>().type.toBeAssignableTo<Stack<A>>();

  expect(Stack([new B()])).type.toBe<Stack<B>>();

  expect<Stack<B>>().type.not.toBeAssignableTo<Stack<C>>();
});

test.skip('OrderedMap covariance', () => {
  expect<OrderedMap<string, B>>().type.toBeAssignableTo<
    OrderedMap<string, A>
  >();

  expect(OrderedMap({ b: new B() })).type.toBe<OrderedMap<string, B>>();

  expect<OrderedMap<string, B>>().type.not.toBeAssignableTo<
    OrderedMap<string, C>
  >();
});

test.skip('OrderedSet covariance', () => {
  expect<OrderedSet<B>>().type.toBeAssignableTo<OrderedSet<A>>();

  expect(OrderedSet([new B()])).type.toBe<OrderedSet<B>>();

  expect<OrderedSet<B>>().type.not.toBeAssignableTo<OrderedSet<C>>();
});
