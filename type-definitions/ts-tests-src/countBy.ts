// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// See .agents/commands/migrate-to-ts.md.

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

test.skip('countBy', () => {
  expect(Collection(['a', 'b', 'c', 'a']).countBy((v) => v)).type.toBe<
    Map<string, number>
  >();

  expect(
    Collection({ a: 1, b: 2, c: 3, d: 1 }).countBy((v) => `key-${v}`)
  ).type.toBe<Map<string, number>>();

  expect(List(['a', 'b', 'c', 'a']).countBy((v) => v.length)).type.toBe<
    Map<number, number>
  >();

  expect(Seq(['a', 'b', 'c', 'a']).countBy((v) => v)).type.toBe<
    Map<string, number>
  >();

  expect(Seq({ a: 1, b: 2, c: 3, d: 1 }).countBy((v) => `key-${v}`)).type.toBe<
    Map<string, number>
  >();

  expect(Set(['a', 'b', 'c', 'a']).countBy((v) => v)).type.toBe<
    Map<string, number>
  >();

  expect(Stack(['a', 'b', 'c', 'a']).countBy((v) => v)).type.toBe<
    Map<string, number>
  >();

  expect(OrderedSet(['a', 'b', 'c', 'a']).countBy((v) => v)).type.toBe<
    Map<string, number>
  >();

  expect(
    Map<string, number>({ a: 1, b: 2, c: 3, d: 1 }).countBy((v) => `key-${v}`)
  ).type.toBe<Map<string, number>>();

  expect(
    OrderedMap({ a: 1, b: 2, c: 3, d: 1 }).countBy((v) => `key-${v}`)
  ).type.toBe<Map<string, number>>();
});

test.skip('countBy grouper arguments', () => {
  const list = List(['a', 'b']);

  list.countBy((value, key, iter) => {
    expect(value).type.toBe<string>();
    expect(key).type.toBe<number>();
    expect(iter).type.toBe<List<string>>();

    return value;
  });

  const map = Map<string, number>({ a: 1 });

  map.countBy((value, key, iter) => {
    expect(value).type.toBe<number>();
    expect(key).type.toBe<string>();
    expect(iter).type.toBe<Map<string, number>>();

    return value;
  });
});
