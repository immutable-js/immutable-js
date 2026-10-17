// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Seq,
  Set,
  Stack,
} from 'immutable';
import { expect, test } from 'tstyche';

test.skip('groupBy', () => {
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
