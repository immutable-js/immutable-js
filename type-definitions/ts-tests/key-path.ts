import {
  KeyPath,
  List,
  Map,
  Record,
  RecordOf,
  removeIn,
  setIn,
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
