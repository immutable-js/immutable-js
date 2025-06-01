import {
  Collection,
  List,
  Map,
  MapOf,
  OrderedMap,
  OrderedSet,
  Seq,
  Set,
  Stack,
} from 'immutable';
import { expect, test } from 'tstyche';

test('groupBy', () => {
  expect(Collection(['a', 'b', 'c', 'a']).groupBy((v) => v)).type.toBe<
    Map<string, Collection.Indexed<string>>
  >();

  expect(
    Collection({ a: 1, b: 2, c: 3, d: 1 }).groupBy((v) => `key-${v}`)
  ).type.toBe<Map<string, Collection.Keyed<string, number>>>();

  expect(List(['a', 'b', 'c', 'a']).groupBy((v) => v)).type.toBe<
    Map<string, List<string>>
  >();

  expect(Seq(['a', 'b', 'c', 'a']).groupBy((v) => v)).type.toBe<
    Map<string, Seq.Indexed<string>>
  >();

  expect(Seq({ a: 1, b: 2, c: 3, d: 1 }).groupBy((v) => `key-${v}`)).type.toBe<
    Map<string, Seq.Keyed<string, number>>
  >();

  expect(Set(['a', 'b', 'c', 'a']).groupBy((v) => v)).type.toBe<
    Map<string, Set<string>>
  >();

  expect(Stack(['a', 'b', 'c', 'a']).groupBy((v) => v)).type.toBe<
    Map<string, Stack<string>>
  >();

  expect(OrderedSet(['a', 'b', 'c', 'a']).groupBy((v) => v)).type.toBe<
    Map<string, OrderedSet<string>>
  >();

  expect(
    Map<string, number>({ a: 1, b: 2, c: 3, d: 1 }).groupBy((v) => `key-${v}`)
  ).type.toBe<Map<string, Map<string, number>>>();

  // type should be something like Map<string, MapOf<Partial{ a: number, b: number, c: number, d: number }>>> but groupBy returns a wrong type with `this`
  expect(Map({ a: 1, b: 2, c: 3, d: 1 }).groupBy((v) => `key-${v}`)).type.toBe<
    Map<string, MapOf<{ a: number; b: number; c: number; d: number }>>
  >();

  expect(
    OrderedMap({ a: 1, b: 2, c: 3, d: 1 }).groupBy((v) => `key-${v}`)
  ).type.toBe<Map<string, OrderedMap<string, number>>>();
});
