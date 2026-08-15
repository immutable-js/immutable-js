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

test('countBy', () => {
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

test('countBy grouper arguments', () => {
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
