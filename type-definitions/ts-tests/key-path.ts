import {
  KeyPath,
  List,
  Map,
  MapOf,
  OrderedMap,
  OrderedSet,
  Record,
  RecordOf,
  Seq,
  Set,
  Stack,
  getIn,
  hasIn,
  removeIn,
  setIn,
  updateIn,
} from 'immutable';
import { expect, test } from 'tstyche';

// what a function receiving a path and forwarding it has
const keyPath: KeyPath<string> = ['x'];

const list = List<number>();
const map = Map<string, number>();
const point = Record({ x: 0 })();

test('a path typed `KeyPath` is accepted wherever a path is', () => {
  expect(list.getIn(keyPath)).type.toBe<unknown>();
  expect(list.hasIn(keyPath)).type.toBe<boolean>();
  expect(list.setIn(keyPath, 0)).type.toBe<List<number>>();
  expect(list.deleteIn(keyPath)).type.toBe<List<number>>();
  expect(list.removeIn(keyPath)).type.toBe<List<number>>();
  expect(list.updateIn(keyPath, (v) => v)).type.toBe<List<number>>();
  expect(list.updateIn(keyPath, 0, (v) => v)).type.toBe<List<number>>();
  expect(list.mergeIn(keyPath, [])).type.toBe<List<number>>();
  expect(list.mergeDeepIn(keyPath, [])).type.toBe<List<number>>();

  expect(map.getIn(keyPath)).type.toBe<unknown>();
  expect(map.hasIn(keyPath)).type.toBe<boolean>();
  expect(map.setIn(keyPath, 0)).type.toBe<Map<string, number>>();
  expect(map.deleteIn(keyPath)).type.toBe<Map<string, number>>();
  expect(map.removeIn(keyPath)).type.toBe<Map<string, number>>();
  expect(map.updateIn(keyPath, (v) => v)).type.toBe<Map<string, number>>();
  expect(map.updateIn(keyPath, 0, (v) => v)).type.toBe<Map<string, number>>();
  expect(map.mergeIn(keyPath, [])).type.toBe<Map<string, number>>();
  expect(map.mergeDeepIn(keyPath, [])).type.toBe<Map<string, number>>();

  expect(point.hasIn(keyPath)).type.toBe<boolean>();
  expect(point.setIn(keyPath, 0)).type.toBe<RecordOf<{ x: number }>>();
  expect(point.deleteIn(keyPath)).type.toBe<RecordOf<{ x: number }>>();
  expect(point.removeIn(keyPath)).type.toBe<RecordOf<{ x: number }>>();
  expect(point.updateIn(keyPath, (v) => v)).type.toBe<
    RecordOf<{ x: number }>
  >();
  expect(point.mergeIn(keyPath, {})).type.toBe<RecordOf<{ x: number }>>();
  expect(point.mergeDeepIn(keyPath, {})).type.toBe<RecordOf<{ x: number }>>();

  expect(setIn(list, keyPath, 0)).type.toBe<List<number>>();
  expect(removeIn(list, keyPath)).type.toBe<List<number>>();
});

test('an array-like which is not iterable is accepted, like at runtime', () => {
  const arrayLike = { length: 1, 0: 'x' };

  expect(list.setIn(arrayLike, 0)).type.toBe<List<number>>();
  expect(map.getIn(arrayLike)).type.toBe<unknown>();
  expect(point.hasIn(arrayLike)).type.toBe<boolean>();
  expect(removeIn(list, arrayLike)).type.toBe<List<number>>();
});

test('an iterable which is neither array-like nor ordered is refused, as the runtime throws', () => {
  const iterable: Iterable<string> = ['x'];

  expect(list.setIn(iterable, 0)).type.toRaiseError();
  expect(map.getIn(iterable)).type.toRaiseError();
  expect(point.hasIn(iterable)).type.toRaiseError();
  expect(setIn(list, iterable, 0)).type.toRaiseError();

  // an ES6 `Set`
  const es6Set = new globalThis.Set(['x']);

  expect(list.setIn(es6Set, 0)).type.toRaiseError();
  expect(map.getIn(es6Set)).type.toRaiseError();
  expect(point.hasIn(es6Set)).type.toRaiseError();
  expect(setIn(list, es6Set, 0)).type.toRaiseError();

  function* generator() {
    yield 'x';
  }

  expect(list.setIn(generator(), 0)).type.toRaiseError();
  expect(map.getIn(generator())).type.toRaiseError();
  expect(point.hasIn(generator())).type.toRaiseError();
  expect(setIn(list, generator(), 0)).type.toRaiseError();
});

// every entry point taking a path, against the same paths
const anyMap = Map<unknown, unknown>();
const mapOf = Map({ a: { b: 0 } as unknown });
const record = Record({ a: { b: 0 } as unknown })();
const obj: { [key: string]: unknown } = {};
const array: Array<unknown> = [];

declare const tuple: readonly ['a', 'b'];
declare const strings: Array<string>;
declare const objectKeys: Array<{ id: number }>;
declare const unknownList: List<unknown>;
declare const stack: Stack<string>;
declare const orderedSet: OrderedSet<string>;
declare const indexedSeq: Seq.Indexed<string>;
declare const arrayLike: ArrayLike<string>;
declare const forwardedKeyPath: KeyPath<unknown>;

declare const word: string;
declare const immutableMap: Map<number, string>;
declare const immutableSet: Set<string>;
declare const setSeq: Seq.Set<string>;
declare const orderedMap: OrderedMap<number, string>;
declare const keyedSeq: Seq.Keyed<string, string>;

declare const unknowns: Array<unknown>;
declare const args: IArguments;
declare const bytes: Uint8Array;

test('a path the runtime follows is accepted everywhere', () => {
  expect(list.setIn(tuple, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(tuple, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(tuple, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(tuple)).type.not.toRaiseError();
  expect(anyMap.hasIn(tuple)).type.not.toRaiseError();
  expect(mapOf.getIn(tuple)).type.not.toRaiseError();
  expect(record.setIn(tuple, 0)).type.not.toRaiseError();
  expect(record.hasIn(tuple)).type.not.toRaiseError();
  expect(record.getIn(tuple)).type.not.toRaiseError();
  expect(getIn(anyMap, tuple)).type.not.toRaiseError();
  expect(getIn(obj, tuple)).type.not.toRaiseError();
  expect(hasIn(anyMap, tuple)).type.not.toRaiseError();
  expect(setIn(anyMap, tuple, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, tuple)).type.not.toRaiseError();
  expect(updateIn(anyMap, tuple, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, tuple, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, tuple, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, tuple, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, tuple, (v) => v)).type.not.toRaiseError();

  expect(list.setIn(strings, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(strings, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(strings, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(strings)).type.not.toRaiseError();
  expect(anyMap.hasIn(strings)).type.not.toRaiseError();
  expect(mapOf.getIn(strings)).type.not.toRaiseError();
  expect(record.setIn(strings, 0)).type.not.toRaiseError();
  expect(record.hasIn(strings)).type.not.toRaiseError();
  expect(record.getIn(strings)).type.not.toRaiseError();
  expect(getIn(anyMap, strings)).type.not.toRaiseError();
  expect(getIn(obj, strings)).type.not.toRaiseError();
  expect(hasIn(anyMap, strings)).type.not.toRaiseError();
  expect(setIn(anyMap, strings, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, strings)).type.not.toRaiseError();
  expect(updateIn(anyMap, strings, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, strings, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, strings, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, strings, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, strings, (v) => v)).type.not.toRaiseError();

  // keys of any type, as in a `Map<object, V>`
  expect(list.setIn(objectKeys, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(objectKeys, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(objectKeys, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(objectKeys)).type.not.toRaiseError();
  expect(anyMap.hasIn(objectKeys)).type.not.toRaiseError();
  expect(mapOf.getIn(objectKeys)).type.not.toRaiseError();
  expect(record.setIn(objectKeys, 0)).type.not.toRaiseError();
  expect(record.hasIn(objectKeys)).type.not.toRaiseError();
  expect(record.getIn(objectKeys)).type.not.toRaiseError();
  expect(getIn(anyMap, objectKeys)).type.not.toRaiseError();
  expect(getIn(obj, objectKeys)).type.not.toRaiseError();
  expect(hasIn(anyMap, objectKeys)).type.not.toRaiseError();
  expect(setIn(anyMap, objectKeys, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, objectKeys)).type.not.toRaiseError();
  expect(updateIn(anyMap, objectKeys, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, objectKeys, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, objectKeys, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, objectKeys, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, objectKeys, (v) => v)).type.not.toRaiseError();

  expect(list.setIn(unknownList, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(unknownList, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(unknownList, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(unknownList)).type.not.toRaiseError();
  expect(anyMap.hasIn(unknownList)).type.not.toRaiseError();
  expect(mapOf.getIn(unknownList)).type.not.toRaiseError();
  expect(record.setIn(unknownList, 0)).type.not.toRaiseError();
  expect(record.hasIn(unknownList)).type.not.toRaiseError();
  expect(record.getIn(unknownList)).type.not.toRaiseError();
  expect(getIn(anyMap, unknownList)).type.not.toRaiseError();
  expect(getIn(obj, unknownList)).type.not.toRaiseError();
  expect(hasIn(anyMap, unknownList)).type.not.toRaiseError();
  expect(setIn(anyMap, unknownList, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, unknownList)).type.not.toRaiseError();
  expect(updateIn(anyMap, unknownList, (v) => v)).type.not.toRaiseError();
  expect(
    updateIn(anyMap, unknownList, 'nsv', (v) => v)
  ).type.not.toRaiseError();
  expect(updateIn(obj, unknownList, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, unknownList, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, unknownList, (v) => v)).type.not.toRaiseError();

  expect(list.setIn(stack, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(stack, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(stack, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(stack)).type.not.toRaiseError();
  expect(anyMap.hasIn(stack)).type.not.toRaiseError();
  expect(mapOf.getIn(stack)).type.not.toRaiseError();
  expect(record.setIn(stack, 0)).type.not.toRaiseError();
  expect(record.hasIn(stack)).type.not.toRaiseError();
  expect(record.getIn(stack)).type.not.toRaiseError();
  expect(getIn(anyMap, stack)).type.not.toRaiseError();
  expect(getIn(obj, stack)).type.not.toRaiseError();
  expect(hasIn(anyMap, stack)).type.not.toRaiseError();
  expect(setIn(anyMap, stack, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, stack)).type.not.toRaiseError();
  expect(updateIn(anyMap, stack, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, stack, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, stack, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, stack, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, stack, (v) => v)).type.not.toRaiseError();

  expect(list.setIn(orderedSet, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(orderedSet, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(orderedSet, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(orderedSet)).type.not.toRaiseError();
  expect(anyMap.hasIn(orderedSet)).type.not.toRaiseError();
  expect(mapOf.getIn(orderedSet)).type.not.toRaiseError();
  expect(record.setIn(orderedSet, 0)).type.not.toRaiseError();
  expect(record.hasIn(orderedSet)).type.not.toRaiseError();
  expect(record.getIn(orderedSet)).type.not.toRaiseError();
  expect(getIn(anyMap, orderedSet)).type.not.toRaiseError();
  expect(getIn(obj, orderedSet)).type.not.toRaiseError();
  expect(hasIn(anyMap, orderedSet)).type.not.toRaiseError();
  expect(setIn(anyMap, orderedSet, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, orderedSet)).type.not.toRaiseError();
  expect(updateIn(anyMap, orderedSet, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, orderedSet, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, orderedSet, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, orderedSet, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, orderedSet, (v) => v)).type.not.toRaiseError();

  expect(list.setIn(indexedSeq, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(indexedSeq, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(indexedSeq, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(indexedSeq)).type.not.toRaiseError();
  expect(anyMap.hasIn(indexedSeq)).type.not.toRaiseError();
  expect(mapOf.getIn(indexedSeq)).type.not.toRaiseError();
  expect(record.setIn(indexedSeq, 0)).type.not.toRaiseError();
  expect(record.hasIn(indexedSeq)).type.not.toRaiseError();
  expect(record.getIn(indexedSeq)).type.not.toRaiseError();
  expect(getIn(anyMap, indexedSeq)).type.not.toRaiseError();
  expect(getIn(obj, indexedSeq)).type.not.toRaiseError();
  expect(hasIn(anyMap, indexedSeq)).type.not.toRaiseError();
  expect(setIn(anyMap, indexedSeq, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, indexedSeq)).type.not.toRaiseError();
  expect(updateIn(anyMap, indexedSeq, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, indexedSeq, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, indexedSeq, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, indexedSeq, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, indexedSeq, (v) => v)).type.not.toRaiseError();

  // an array-like which is not iterable
  expect(list.setIn(arrayLike, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(arrayLike, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(arrayLike, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(arrayLike)).type.not.toRaiseError();
  expect(anyMap.hasIn(arrayLike)).type.not.toRaiseError();
  expect(mapOf.getIn(arrayLike)).type.not.toRaiseError();
  expect(record.setIn(arrayLike, 0)).type.not.toRaiseError();
  expect(record.hasIn(arrayLike)).type.not.toRaiseError();
  expect(record.getIn(arrayLike)).type.not.toRaiseError();
  expect(getIn(anyMap, arrayLike)).type.not.toRaiseError();
  expect(getIn(obj, arrayLike)).type.not.toRaiseError();
  expect(hasIn(anyMap, arrayLike)).type.not.toRaiseError();
  expect(setIn(anyMap, arrayLike, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, arrayLike)).type.not.toRaiseError();
  expect(updateIn(anyMap, arrayLike, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, arrayLike, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, arrayLike, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, arrayLike, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, arrayLike, (v) => v)).type.not.toRaiseError();

  // what a wrapper function forwards
  expect(list.setIn(forwardedKeyPath, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(forwardedKeyPath, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(forwardedKeyPath, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(forwardedKeyPath)).type.not.toRaiseError();
  expect(anyMap.hasIn(forwardedKeyPath)).type.not.toRaiseError();
  expect(mapOf.getIn(forwardedKeyPath)).type.not.toRaiseError();
  expect(record.setIn(forwardedKeyPath, 0)).type.not.toRaiseError();
  expect(record.hasIn(forwardedKeyPath)).type.not.toRaiseError();
  expect(record.getIn(forwardedKeyPath)).type.not.toRaiseError();
  expect(getIn(anyMap, forwardedKeyPath)).type.not.toRaiseError();
  expect(getIn(obj, forwardedKeyPath)).type.not.toRaiseError();
  expect(hasIn(anyMap, forwardedKeyPath)).type.not.toRaiseError();
  expect(setIn(anyMap, forwardedKeyPath, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, forwardedKeyPath)).type.not.toRaiseError();
  expect(updateIn(anyMap, forwardedKeyPath, (v) => v)).type.not.toRaiseError();
  expect(
    updateIn(anyMap, forwardedKeyPath, 'nsv', (v) => v)
  ).type.not.toRaiseError();
  expect(updateIn(obj, forwardedKeyPath, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, forwardedKeyPath, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, forwardedKeyPath, (v) => v)).type.not.toRaiseError();
});

test('a path the runtime throws on is refused everywhere', () => {
  // `Invalid keyPath`, unlike `[word]`
  expect(list.setIn(word, 0)).type.toRaiseError();
  expect(anyMap.setIn(word, 0)).type.toRaiseError();
  expect(anyMap.updateIn(word, (v) => v)).type.toRaiseError();
  expect(anyMap.getIn(word)).type.toRaiseError();
  expect(anyMap.hasIn(word)).type.toRaiseError();
  expect(mapOf.getIn(word)).type.toRaiseError();
  expect(record.setIn(word, 0)).type.toRaiseError();
  expect(record.hasIn(word)).type.toRaiseError();
  expect(record.getIn(word)).type.toRaiseError();
  expect(getIn(anyMap, word)).type.toRaiseError();
  expect(getIn(obj, word)).type.toRaiseError();
  expect(hasIn(anyMap, word)).type.toRaiseError();
  expect(setIn(anyMap, word, 0)).type.toRaiseError();
  expect(removeIn(anyMap, word)).type.toRaiseError();
  expect(updateIn(anyMap, word, (v) => v)).type.toRaiseError();
  expect(updateIn(anyMap, word, 'nsv', (v) => v)).type.toRaiseError();
  expect(updateIn(obj, word, (v) => v)).type.toRaiseError();
  expect(updateIn(array, word, (v) => v)).type.toRaiseError();
  expect(updateIn(record, word, (v) => v)).type.toRaiseError();

  expect(list.setIn(immutableMap, 0)).type.toRaiseError();
  expect(anyMap.setIn(immutableMap, 0)).type.toRaiseError();
  expect(anyMap.updateIn(immutableMap, (v) => v)).type.toRaiseError();
  expect(anyMap.getIn(immutableMap)).type.toRaiseError();
  expect(anyMap.hasIn(immutableMap)).type.toRaiseError();
  expect(mapOf.getIn(immutableMap)).type.toRaiseError();
  expect(record.setIn(immutableMap, 0)).type.toRaiseError();
  expect(record.hasIn(immutableMap)).type.toRaiseError();
  expect(record.getIn(immutableMap)).type.toRaiseError();
  expect(getIn(anyMap, immutableMap)).type.toRaiseError();
  expect(getIn(obj, immutableMap)).type.toRaiseError();
  expect(hasIn(anyMap, immutableMap)).type.toRaiseError();
  expect(setIn(anyMap, immutableMap, 0)).type.toRaiseError();
  expect(removeIn(anyMap, immutableMap)).type.toRaiseError();
  expect(updateIn(anyMap, immutableMap, (v) => v)).type.toRaiseError();
  expect(updateIn(anyMap, immutableMap, 'nsv', (v) => v)).type.toRaiseError();
  expect(updateIn(obj, immutableMap, (v) => v)).type.toRaiseError();
  expect(updateIn(array, immutableMap, (v) => v)).type.toRaiseError();
  expect(updateIn(record, immutableMap, (v) => v)).type.toRaiseError();

  expect(list.setIn(immutableSet, 0)).type.toRaiseError();
  expect(anyMap.setIn(immutableSet, 0)).type.toRaiseError();
  expect(anyMap.updateIn(immutableSet, (v) => v)).type.toRaiseError();
  expect(anyMap.getIn(immutableSet)).type.toRaiseError();
  expect(anyMap.hasIn(immutableSet)).type.toRaiseError();
  expect(mapOf.getIn(immutableSet)).type.toRaiseError();
  expect(record.setIn(immutableSet, 0)).type.toRaiseError();
  expect(record.hasIn(immutableSet)).type.toRaiseError();
  expect(record.getIn(immutableSet)).type.toRaiseError();
  expect(getIn(anyMap, immutableSet)).type.toRaiseError();
  expect(getIn(obj, immutableSet)).type.toRaiseError();
  expect(hasIn(anyMap, immutableSet)).type.toRaiseError();
  expect(setIn(anyMap, immutableSet, 0)).type.toRaiseError();
  expect(removeIn(anyMap, immutableSet)).type.toRaiseError();
  expect(updateIn(anyMap, immutableSet, (v) => v)).type.toRaiseError();
  expect(updateIn(anyMap, immutableSet, 'nsv', (v) => v)).type.toRaiseError();
  expect(updateIn(obj, immutableSet, (v) => v)).type.toRaiseError();
  expect(updateIn(array, immutableSet, (v) => v)).type.toRaiseError();
  expect(updateIn(record, immutableSet, (v) => v)).type.toRaiseError();

  expect(list.setIn(setSeq, 0)).type.toRaiseError();
  expect(anyMap.setIn(setSeq, 0)).type.toRaiseError();
  expect(anyMap.updateIn(setSeq, (v) => v)).type.toRaiseError();
  expect(anyMap.getIn(setSeq)).type.toRaiseError();
  expect(anyMap.hasIn(setSeq)).type.toRaiseError();
  expect(mapOf.getIn(setSeq)).type.toRaiseError();
  expect(record.setIn(setSeq, 0)).type.toRaiseError();
  expect(record.hasIn(setSeq)).type.toRaiseError();
  expect(record.getIn(setSeq)).type.toRaiseError();
  expect(getIn(anyMap, setSeq)).type.toRaiseError();
  expect(getIn(obj, setSeq)).type.toRaiseError();
  expect(hasIn(anyMap, setSeq)).type.toRaiseError();
  expect(setIn(anyMap, setSeq, 0)).type.toRaiseError();
  expect(removeIn(anyMap, setSeq)).type.toRaiseError();
  expect(updateIn(anyMap, setSeq, (v) => v)).type.toRaiseError();
  expect(updateIn(anyMap, setSeq, 'nsv', (v) => v)).type.toRaiseError();
  expect(updateIn(obj, setSeq, (v) => v)).type.toRaiseError();
  expect(updateIn(array, setSeq, (v) => v)).type.toRaiseError();
  expect(updateIn(record, setSeq, (v) => v)).type.toRaiseError();
});

test('a keyed collection is refused everywhere, its entries would be used as keys', () => {
  expect(list.setIn(orderedMap, 0)).type.toRaiseError();
  expect(anyMap.setIn(orderedMap, 0)).type.toRaiseError();
  expect(anyMap.updateIn(orderedMap, (v) => v)).type.toRaiseError();
  expect(anyMap.getIn(orderedMap)).type.toRaiseError();
  expect(anyMap.hasIn(orderedMap)).type.toRaiseError();
  expect(mapOf.getIn(orderedMap)).type.toRaiseError();
  expect(record.setIn(orderedMap, 0)).type.toRaiseError();
  expect(record.hasIn(orderedMap)).type.toRaiseError();
  expect(record.getIn(orderedMap)).type.toRaiseError();
  expect(getIn(anyMap, orderedMap)).type.toRaiseError();
  expect(getIn(obj, orderedMap)).type.toRaiseError();
  expect(hasIn(anyMap, orderedMap)).type.toRaiseError();
  expect(setIn(anyMap, orderedMap, 0)).type.toRaiseError();
  expect(removeIn(anyMap, orderedMap)).type.toRaiseError();
  expect(updateIn(anyMap, orderedMap, (v) => v)).type.toRaiseError();
  expect(updateIn(anyMap, orderedMap, 'nsv', (v) => v)).type.toRaiseError();
  expect(updateIn(obj, orderedMap, (v) => v)).type.toRaiseError();
  expect(updateIn(array, orderedMap, (v) => v)).type.toRaiseError();
  expect(updateIn(record, orderedMap, (v) => v)).type.toRaiseError();

  expect(list.setIn(keyedSeq, 0)).type.toRaiseError();
  expect(anyMap.setIn(keyedSeq, 0)).type.toRaiseError();
  expect(anyMap.updateIn(keyedSeq, (v) => v)).type.toRaiseError();
  expect(anyMap.getIn(keyedSeq)).type.toRaiseError();
  expect(anyMap.hasIn(keyedSeq)).type.toRaiseError();
  expect(mapOf.getIn(keyedSeq)).type.toRaiseError();
  expect(record.setIn(keyedSeq, 0)).type.toRaiseError();
  expect(record.hasIn(keyedSeq)).type.toRaiseError();
  expect(record.getIn(keyedSeq)).type.toRaiseError();
  expect(getIn(anyMap, keyedSeq)).type.toRaiseError();
  expect(getIn(obj, keyedSeq)).type.toRaiseError();
  expect(hasIn(anyMap, keyedSeq)).type.toRaiseError();
  expect(setIn(anyMap, keyedSeq, 0)).type.toRaiseError();
  expect(removeIn(anyMap, keyedSeq)).type.toRaiseError();
  expect(updateIn(anyMap, keyedSeq, (v) => v)).type.toRaiseError();
  expect(updateIn(anyMap, keyedSeq, 'nsv', (v) => v)).type.toRaiseError();
  expect(updateIn(obj, keyedSeq, (v) => v)).type.toRaiseError();
  expect(updateIn(array, keyedSeq, (v) => v)).type.toRaiseError();
  expect(updateIn(record, keyedSeq, (v) => v)).type.toRaiseError();
});

test('the `getIn` family only refuses `Array<unknown>`, `arguments` and typed arrays', () => {
  expect(list.setIn(unknowns, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(unknowns, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(unknowns, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(unknowns)).type.not.toRaiseError();
  expect(anyMap.hasIn(unknowns)).type.not.toRaiseError();
  expect(mapOf.getIn(unknowns)).type.toRaiseError();
  expect(record.setIn(unknowns, 0)).type.not.toRaiseError();
  expect(record.hasIn(unknowns)).type.not.toRaiseError();
  expect(record.getIn(unknowns)).type.toRaiseError();
  expect(getIn(anyMap, unknowns)).type.toRaiseError();
  expect(getIn(obj, unknowns)).type.toRaiseError();
  expect(hasIn(anyMap, unknowns)).type.not.toRaiseError();
  expect(setIn(anyMap, unknowns, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, unknowns)).type.not.toRaiseError();
  expect(updateIn(anyMap, unknowns, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, unknowns, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, unknowns, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, unknowns, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, unknowns, (v) => v)).type.not.toRaiseError();

  expect(list.setIn(args, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(args, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(args, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(args)).type.not.toRaiseError();
  expect(anyMap.hasIn(args)).type.not.toRaiseError();
  expect(mapOf.getIn(args)).type.toRaiseError();
  expect(record.setIn(args, 0)).type.not.toRaiseError();
  expect(record.hasIn(args)).type.not.toRaiseError();
  expect(record.getIn(args)).type.toRaiseError();
  expect(getIn(anyMap, args)).type.toRaiseError();
  expect(getIn(obj, args)).type.toRaiseError();
  expect(hasIn(anyMap, args)).type.not.toRaiseError();
  expect(setIn(anyMap, args, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, args)).type.not.toRaiseError();
  expect(updateIn(anyMap, args, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, args, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, args, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, args, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, args, (v) => v)).type.not.toRaiseError();

  expect(list.setIn(bytes, 0)).type.not.toRaiseError();
  expect(anyMap.setIn(bytes, 0)).type.not.toRaiseError();
  expect(anyMap.updateIn(bytes, (v) => v)).type.not.toRaiseError();
  expect(anyMap.getIn(bytes)).type.not.toRaiseError();
  expect(anyMap.hasIn(bytes)).type.not.toRaiseError();
  expect(mapOf.getIn(bytes)).type.toRaiseError();
  expect(record.setIn(bytes, 0)).type.not.toRaiseError();
  expect(record.hasIn(bytes)).type.not.toRaiseError();
  expect(record.getIn(bytes)).type.toRaiseError();
  expect(getIn(anyMap, bytes)).type.toRaiseError();
  expect(getIn(obj, bytes)).type.toRaiseError();
  expect(hasIn(anyMap, bytes)).type.not.toRaiseError();
  expect(setIn(anyMap, bytes, 0)).type.not.toRaiseError();
  expect(removeIn(anyMap, bytes)).type.not.toRaiseError();
  expect(updateIn(anyMap, bytes, (v) => v)).type.not.toRaiseError();
  expect(updateIn(anyMap, bytes, 'nsv', (v) => v)).type.not.toRaiseError();
  expect(updateIn(obj, bytes, (v) => v)).type.not.toRaiseError();
  expect(updateIn(array, bytes, (v) => v)).type.not.toRaiseError();
  expect(updateIn(record, bytes, (v) => v)).type.not.toRaiseError();
});
