/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// Some tests look like they are repeated in order to avoid false positives.
// Flow might not complain about an instance of (what it thinks is) T to be assigned to T<K, V>

import Immutable, {
  List,
  Map,
  Stack,
  Set,
  Seq,
  Range,
  Repeat,
  Record,
  OrderedMap,
  OrderedSet,
  get,
  getIn,
  has,
  hasIn,
  merge,
  mergeDeep,
  mergeWith,
  mergeDeepWith,
  remove,
  removeIn,
  set,
  setIn,
  update,
  updateIn,
} from '../../';
import * as Immutable2 from '../../';

import type {
  KeyedCollection,
  IndexedCollection,
  SetCollection,
  KeyedSeq,
  IndexedSeq,
  SetSeq,
  RecordFactory,
  RecordOf,
} from '../../';

/**
 * Although this looks like dead code, importing `Immutable` and
 * `Immutable2` tests:
 *
 * 1. that default import works -- `import Immutable, {...} from 'immutable'
 * 2. that importing everything works -- `import * as X from 'immutable'`
 * 3. that individual imports are supported
 */
const ImmutableList = Immutable.List;
const ImmutableMap = Immutable.Map;
const ImmutableStack = Immutable.Stack;
const ImmutableSet = Immutable.Set;
const ImmutableKeyedCollection: KeyedCollection<
  *,
  *
> = Immutable.Collection.Keyed();
const ImmutableRange = Immutable.Range;
const ImmutableRepeat = Immutable.Repeat;
const ImmutableIndexedSeq: IndexedSeq<*> = Immutable.Seq.Indexed();

const Immutable2List = Immutable2.List;
const Immutable2Map = Immutable2.Map;
const Immutable2Stack = Immutable2.Stack;
const Immutable2Set = Immutable2.Set;
const Immutable2KeyedCollection: Immutable2.KeyedCollection<
  *,
  *
> = Immutable2.Collection.Keyed();
const Immutable2Range = Immutable2.Range;
const Immutable2Repeat = Immutable2.Repeat;
const Immutable2IndexedSeq: Immutable2.IndexedSeq<*> = Immutable2.Seq.Indexed();

var defaultExport: List<*> = Immutable.List();
var moduleExport: List<*> = Immutable2.List();

var numberList: List<number> = List();
var numberOrStringList: List<string | number> = List();
var nullableNumberList: List<?number> = List();
var stringToNumber: Map<string, number> = Map();
var orderedStringToNumber: OrderedMap<string, number> = OrderedMap();
var orderedStringToString: OrderedMap<string, string> = OrderedMap();
var orderedStringToNumberOrString: OrderedMap<
  string,
  string | number
> = OrderedMap();
var orderedNumberToString: OrderedMap<number, string> = OrderedMap();
var orderedNumberToNumber: OrderedMap<number, number> = OrderedMap();
var stringToNumberOrString: Map<string, string | number> = Map();
var numberToString: Map<number, string> = Map();
var stringOrNumberToNumberOrString: Map<
  string | number,
  string | number
> = Map();
var anyMap: Map<any, any> = Map();
var numberSet: Set<number> = Set();
var orderedStringSet: OrderedSet<string> = OrderedSet();
var orderedNumberSet: OrderedSet<number> = OrderedSet();
var orderedNumberOrStringSet: OrderedSet<string | number> = OrderedSet();
var numberOrStringSet: Set<number | string> = Set();
var stringSet: Set<string> = Set();
var numberStack: Stack<number> = Stack();
var numberOrStringStack: Stack<string | number> = Stack();
var number: number = 0;
var stringToNumberCollection: KeyedCollection<string, number> = stringToNumber;
var numberToStringCollection: KeyedCollection<number, string> = numberToString;

numberList = List([1, 2]);
var numberListSize: number = numberList.size;
numberOrStringList = List(['a', 1]);
// $ExpectError
numberList = List(['a', 'b']);

numberList = List.of(1, 2);
numberOrStringList = List.of('a', 1);
// $ExpectError
numberList = List.of('a', 1);

numberList = List().set(0, 0);
numberOrStringList = List.of(0).set(1, 'a');
// $ExpectError
numberList = List().set(0, 'a');

numberList = List.of(1, 2, 3);
// $ExpectError
var item: number = numberList.get(4);
var nullableItem: ?number = numberList.get(4);
var itemOrDefault: number = numberList.get(4, 10);

numberList = List().insert(0, 0);
numberOrStringList = List.of(0).insert(1, 'a');
// $ExpectError
numberList = List().insert(0, 'a');

numberList = List().push(1, 1);
numberOrStringList = List().push(1, 'a');
// $ExpectError
numberList = List().push(0, 'a');

numberList = List().unshift(1, 1);
numberOrStringList = List().unshift(1, 'a');
// $ExpectError
numberList = List().unshift(0, 'a');

numberList = List.of(1).delete(0);
// $ExpectError
numberList = List.of('a').delete(0);

numberList = List.of(1).remove(0);
// $ExpectError
numberList = List.of('a').remove(0);

numberList = List.of(1).clear();
// $ExpectError
numberList = List.of('a').clear();

numberList = List.of(1).pop();
// $ExpectError
numberList = List.of('a').pop();

numberList = List.of(1).shift();
// $ExpectError
numberList = List.of('a').shift();

numberList = List.of('a').update((value) => List.of(1));
// $ExpectError
numberList = List.of(1).update((value) => List.of('a'));

numberOrStringList = List.of('a').update(0, (value) => 1);
// $ExpectError
numberList = List.of(1).update(0, (value) => 'a');

numberOrStringList = List.of(1).update(1, 0, (value) => 'a');
// $ExpectError
numberList = List.of(1).update(1, 0, (value) => 'a');

numberList = List.of(1).merge(List.of(2));
numberOrStringList = List.of('a').merge(List.of(1));
// $ExpectError
numberList = List.of('a').merge(List.of(1));

// Functional API

numberList = merge(List([1]), List([2]));
numberOrStringList = merge(List(['a']), List([1]));
// $ExpectError
numberList = merge(List(['a']), List([1]));

nullableNumberList = List.of(1).setSize(2);

// $ExpectError setIn [] replaces the top-most value. number ~> List<number>
numberList = List([1]).setIn([], 0);
{
  const x: number = List([1]).setIn([], 0);
}
// $ExpectError "a" is not a valid key for List.
numberList = List([1]).setIn(['a'], 0);
// $ExpectError "a" is not a valid value for List of number.
numberList = List([1]).setIn([0], 'a');
numberList = List([1]).setIn([0], 0);

// $ExpectError "a" is not a valid key for List.
List([List([List([1])])]).setIn([0, 0, 'a'], 'a');
// $ExpectError "a" is not a valid value for List of number.
List([List([List([1])])]).setIn([0, 0, 0], 'a');
List([List([List([1])])]).setIn([0, 0, 0], 123);

// $ExpectError deleteIn [] replaces the top-most value. void ~> List<number>
numberList = List([1]).deleteIn([]);
{
  const x: void = List([1]).deleteIn([]);
}
// $ExpectError
numberList = List([1]).removeIn([]);
// $ExpectError "a" is not a valid key for List.
numberList = List([1]).deleteIn(['a']);
// $ExpectError
numberList = List([1]).removeIn(['a']);
numberList = List([1]).deleteIn([0]);
numberList = List([1]).removeIn([0]);

// Functional API

// $ExpectError deleteIn [] replaces the top-most value. void ~> List<number>
numberList = removeIn(List([1]), []);
{
  const x: void = removeIn(List([1]), []);
}
// $ExpectError "a" is not a valid key for List.
numberList = removeIn(List([1]), ['a']);
numberList = removeIn(List([1]), [0]);

// $ExpectError updateIn [] replaces the top-most value. number ~> List<number>
numberList = List([1]).updateIn([], () => 123);
{
  const x: number = List([1]).updateIn([], () => 123);
}
// $ExpectError - 'a' is not a number
numberList = List([1]).updateIn([0], (val) => 'a');
// $ExpectError
numberList = List([1]).updateIn([0], 0, (val) => 'a');
// $ExpectError - 'a' in an invalid argument
numberList = List([1]).updateIn([0], 'a');
// $ExpectError
numberList = List([1]).updateIn([0], 0, 'a');
numberList = List([1]).updateIn([0], (val) => val + 1);
numberList = List([1]).updateIn([0], 0, (val) => val + 1);

numberList = List.of(1).mergeIn([], []);
numberList = List.of(1).mergeDeepIn([], []);

numberList = List.of(1).withMutations((mutable) => mutable);

numberList = List.of(1).asMutable();
numberList = List.of(1).asImmutable();

numberList = List.of(1).map((value, index, iter) => 1);
// $ExpectError
numberList = List.of(1).map((value, index, iter) => 'a');

numberList = List.of(1).flatMap((value, index, iter) => [1]);
// $ExpectError
numberList = List.of(1).flatMap((value, index, iter) => ['a']);

numberList = List.of(1).flatten();

// Specific type for filter(Boolean) which removes nullability.
numberList = nullableNumberList.filter(Boolean);

/* Map */

stringToNumber = Map();
let stringToNumberSize: number = stringToNumber.size;
stringToNumberOrString = Map();
numberToString = Map();

stringToNumber = Map({ a: 1 });
// $ExpectError
stringToNumber = Map({ a: 'a' });

stringToNumber = Map([['a', 1]]);
stringToNumber = Map(List([['a', 1]]));
// $ExpectError
stringToNumber = Map([['a', 'b']]);
// $ExpectError -- this is actually a Map<string, string>
stringToNumber = Map(List([['a', 'a']]));
// $FlowFixMe - This is Iterable<Iterable<string>>, ideally it could be interpreted as Iterable<[string, string]>
stringToNumber = Map(List([List(['a', 'a'])]));

stringOrNumberToNumberOrString = Map({ a: 'a' }).set('b', 1).set(2, 'c');
// $ExpectError
stringToNumber = Map({ a: 0 }).set('b', '');
// $ExpectError
stringToNumber = Map().set(1, '');

// Functional API

stringToNumber = set(set(Map({ a: 0 }), 'b', 1), 'c', 2);
// $ExpectError - Functional API currently requires arguments to have the same value types.
stringOrNumberToNumberOrString = set(set(Map({ a: 'a' }), 'b', 1), 2, 'c');
// $ExpectError
stringToNumber = set(Map({ a: 0 }), 'b', '');
// $ExpectError
stringToNumber = set(Map(), 1, '');

stringToNumber = Map({ a: 0 }).delete('a');
stringToNumber = Map({ a: 0 }).remove('a');
// $ExpectError
stringToNumber = Map({ a: 0 }).delete(1);
// $ExpectError
stringToNumber = Map({ a: 0 }).remove(1);

stringToNumber = Map({ a: 0 }).deleteAll(['a']);
stringToNumber = Map({ a: 0 }).removeAll(['a']);
// $ExpectError
stringToNumber = Map({ a: 0 }).deleteAll(1);
// $ExpectError
stringToNumber = Map({ a: 0 }).deleteAll([1]);
// $ExpectError
stringToNumber = Map({ a: 0 }).removeAll([1]);

stringToNumber = Map({ a: 0 }).clear();

stringToNumber = Map({ a: 1 }).update((value) => Map({ a: 1 }));
// $ExpectError
stringToNumber = Map({ a: 1 }).update((value) => Map({ 1: 'a' }));

stringToNumberOrString = Map({ a: 1 }).update('a', (value) => 'a');
// $ExpectError
stringToNumber = Map({ a: 1 }).update('a', (value) => 'a');

stringToNumberOrString = Map({ a: 1 }).update('a', 'b', (value) => 'a');
// $ExpectError
stringToNumber = Map({ a: 1 }).update('a', 'b', (value) => 'a');
// $ExpectError
stringToNumberOrString = Map({ a: 1 }).merge({ a: { a: '1' } });
// $ExpectError
stringToNumberOrString = Map({ a: 1 }).update('a', 'b', (value) => {
  a: '1';
});

stringToNumber = Map({ a: 1 }).merge(Map({ a: 1 }));
stringToNumberOrString = Map({ a: 1 }).merge({ a: 'b' });
// $ExpectError
stringToNumber = Map({ a: 1 }).merge({ a: 'b' });
// $ExpectError
stringToNumber = Map({ a: 1 }).merge([[1, 'a']]);
// $ExpectError
stringToNumber = Map({ a: 1 }).merge(numberToString);

// Functional API
stringToNumber = merge(Map({ a: 1 }), Map({ a: 1 }));
// $ExpectError - Functional API currently requires arguments to have the same value types.
stringToNumberOrString = merge(Map({ a: 1 }), { a: 'b' });
// $ExpectError
stringToNumber = merge(Map({ a: 1 }), { a: 'b' });
// $ExpectError
stringToNumber = merge(Map({ a: 1 }), [[1, 'a']]);
// $ExpectError
stringToNumber = merge(Map({ a: 1 }), numberToString);

stringToNumber = Map({ a: 1 }).mergeWith((previous, next, key) => 1, {
  a: 2,
  b: 2,
});
// $ExpectError - this is actually a Map<string, number|string>
stringToNumber = Map({ a: 1 }).mergeWith(
  (previous, next, key) => previous + next,
  { a: '2', b: '2' }
);
stringToNumberOrString = Map({ a: 1 }).mergeWith(
  (previous, next, key) => previous + next,
  { a: '2', b: '2' }
);
// $ExpectError - the array [1] is not a valid argument
stringToNumber = Map({ a: 1 }).mergeWith((previous, next, key) => 1, [1]);

stringToNumberOrString = Map({ a: 1 }).mergeDeep({ a: 'b' });
// $ExpectError
stringToNumber = Map({ a: 1 }).mergeDeep({ a: 'b' });

stringToNumber = Map({ a: 1 }).mergeDeepWith((previous, next, key) => 1, {
  a: 2,
  b: 2,
});
// $ExpectError - this is actually a Map<string, number|string>
stringToNumber = Map({ a: 1 }).mergeDeepWith((previous, next, key) => 1, {
  a: '2',
  b: '2',
});
stringToNumberOrString = Map({ a: 1 }).mergeDeepWith(
  (previous, next, key) => 1,
  { a: '2', b: '2' }
);
// $ExpectError - the array [1] is not a valid argument
stringToNumber = Map({ a: 1 }).mergeDeepWith((previous, next, key) => 1, [1]);

// KeyedSeq can merge into Map
var stringToStringSeq: KeyedSeq<string, string> = Seq({ b: 'B' });
stringToNumberOrString = Map({ a: 1 }).merge(stringToStringSeq);

// $ExpectError
stringToNumber = Map({ a: 1 }).setIn([], 0);
// $ExpectError
stringToNumber = Map({ a: 1 }).setIn(['a'], 'a');
stringToNumber = Map({ a: 1 }).setIn(['a'], 0);

// $ExpectError
stringToNumber = Map({ a: 1 }).deleteIn([]);
// $ExpectError
stringToNumber = Map({ a: 1 }).removeIn([]);
stringToNumber = Map({ a: 1 }).deleteIn(['a']);
stringToNumber = Map({ a: 1 }).removeIn(['a']);

// $ExpectError
stringToNumber = Map({ a: 1 }).updateIn([], (v) => v + 1);
// $ExpectError
stringToNumber = Map({ a: 1 }).updateIn(['a'], (v) => 'a');
stringToNumber = Map({ a: 1 }).updateIn(['a'], (v) => v + 1);
stringToNumber = Map({ a: 1 }).updateIn(['a'], 0, (v) => v + 1);

// $ExpectError
Map({ x: Map({ y: Map({ z: 1 }) }) }).updateIn(['x', 'y', 1], (v) => v + 1);
// $ExpectError
Map({ x: Map({ y: Map({ z: 1 }) }) }).updateIn(['x', 'y', 'z'], (v) => 'a');
Map({ x: Map({ y: Map({ z: 1 }) }) }).updateIn(['x', 'y', 'z'], (v) => v + 1);
Map({ x: Map({ y: Map({ z: 1 }) }) }).updateIn(
  ['x', 'y', 'z'],
  0,
  (v) => v + 1
);

stringToNumber = Map({ a: 1 }).mergeIn([], []);
stringToNumber = Map({ a: 1 }).mergeDeepIn([], []);

anyMap = Map({ a: {} }).mergeIn(['a'], Map({ b: 2 }));
anyMap = Map({ a: {} }).mergeDeepIn(['a'], Map({ b: 2 }));
anyMap = Map({ a: {} }).mergeIn(['a'], List([1, 2]));
anyMap = Map({ a: {} }).mergeDeepIn(['a'], List([1, 2]));
anyMap = Map({ a: {} }).mergeIn(['a'], { b: 2 });
anyMap = Map({ a: {} }).mergeDeepIn(['a'], { b: 2 });
// $ExpectError: not iterable / object
anyMap = Map({ a: {} }).mergeIn(['a'], 1);
// $ExpectError: not iterable / object
anyMap = Map({ a: {} }).mergeDeepIn(['a'], 1);
// $ExpectError: bad key type
stringToNumber = Map({ a: {} }).mergeIn([1], { b: 2 });
// $ExpectError: bad key type
stringToNumber = Map({ a: {} }).mergeDeepIn([1], { b: 2 });

stringToNumber = Map({ a: 1 }).withMutations((mutable) => mutable);

stringToNumber = Map({ a: 1 }).asMutable();
stringToNumber = Map({ a: 1 }).asImmutable();

stringToNumber = Map({ a: 1 }).map((value, index, iter) => 1);
// $ExpectError
stringToNumber = Map({ a: 1 }).map((value, index, iter) => 'a');

stringToNumber = Map({ a: 1 }).flatMap((value, index, iter) => [['b', 1]]);
// $ExpectError
stringToNumber = Map({ a: 1 }).flatMap((value, index, iter) => [['a', 'a']]);
// $ExpectError
stringToNumber = Map({ a: 1 }).flatMap((value, index, iter) => Map({ a: 'a' }));

numberToString = Map({ a: 1 }).flip();
// $ExpectError
stringToNumber = Map({ a: 1 }).flip();

numberToString = Map({ a: 'a' }).mapKeys((key, value, iter) => 1);
// $ExpectError
stringToNumber = Map({ a: 1 }).mapKeys((key, value, iter) => 1);

anyMap = Map({ a: 1 }).flatten();

var stringToNullableNumber = Map({ a: 1, b: null });
// $ExpectError
stringToNumber = stringToNullableNumber;
// Specific type for filter(Boolean) which removes nullability.
stringToNumber = stringToNullableNumber.filter(Boolean);

/* OrderedMap */

orderedStringToNumber = Map({ a: 1 }).toOrderedMap();
// $ExpectError - this is actually an OrderedMap<string,string>
orderedStringToNumber = Map({ a: 'b' }).toOrderedMap();
orderedStringToString = Map({ a: 'b' }).toOrderedMap();

orderedStringToNumber = OrderedMap({ a: 1 });
// $ExpectError - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap({ a: '1' });
orderedStringToString = OrderedMap({ a: '1' });

orderedStringToNumber = OrderedMap(Map({ a: 1 }));
// $ExpectError - it's actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap(Map({ a: '1' }));

orderedStringToNumber = OrderedMap();

orderedStringToNumber = OrderedMap().set('b', 2);
// $ExpectError - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap().set('b', '2');
orderedStringToString = OrderedMap().set('b', '2');

orderedStringToNumber = OrderedMap({ a: 1 }).delete('a');
orderedStringToNumber = OrderedMap({ a: 1 }).remove('a');
orderedStringToNumber = OrderedMap({ a: 1 }).clear();

orderedStringToNumber = OrderedMap({ a: 1 }).update(() => OrderedMap({ b: 1 }));
/**
 * TODO: the following is valid but I question if it should be valid:
 *
 * ```
 * const x: OrderedMap<string, string> = OrderedMap({'a': 1})
 *   .update(() => OrderedMap({'b': '1'}))
 * ```
 *
 * In the above example, `update` is changing an OrderedMap<string, number> to an OrderedMap<string, string>
 * This seems inconsistent with the typescript signature of
 *
 * ```
 * update(updater: (value: Map<K, V>) => Map<K, V>): Map<K, V>
 * ```
 */
// $ExpectError - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap({ a: 1 }).update(() =>
  OrderedMap({ b: '1' })
);
orderedStringToString = OrderedMap({ a: 1 }).update(() =>
  OrderedMap({ b: '1' })
);

orderedStringToNumber = OrderedMap({ a: 1 }).update('a', (value) => value + 1);
/**
 * TODO: is the below the intended functionality? The typescript signature looks like
 *
 * ```
 * update(key: K, updater: (value: V) => V): Map<K, V>;
 * ```
 *
 * so it seems like in this case the updater should only be able to return numbers.
 * This comment applies to all of the update / merge functions in Map and OrderedMap
 */
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).update('a', () => 'b');
orderedStringToNumberOrString = OrderedMap({ a: 1 }).update('a', () => 'b');

orderedStringToNumber = OrderedMap({ a: 1 }).update(
  'a',
  0,
  (value) => value + 1
);
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).update('a', 0, () => 'b');
orderedStringToNumberOrString = OrderedMap({ a: 1 }).update('a', 0, () => 'b');

orderedStringToNumber = OrderedMap({ a: 1 }).merge({ b: 2 });
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).merge({ b: '2' });
orderedStringToNumberOrString = OrderedMap({ a: 1 }).merge({ b: '2' });

orderedStringToNumber = OrderedMap({ a: 1 }).mergeWith((prev, next) => next, {
  a: 2,
  b: 3,
});
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).mergeWith((prev, next) => next, {
  a: '2',
  b: '3',
});
orderedStringToNumberOrString = OrderedMap({ a: 1 }).mergeWith(
  (prev, next) => next,
  { a: '2', b: '3' }
);
// $ExpectError - the array [1] is not a valid argument
orderedStringToNumber = OrderedMap({ a: 1 }).mergeWith((prev, next) => next, [
  1,
]);

orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeep({ a: 2 });
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeep({ a: '2' });
orderedStringToNumberOrString = OrderedMap({ a: 1 }).mergeDeep({ a: '2' });

orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeepWith(
  (prev, next) => next,
  { a: 2, b: 3 }
);
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeepWith(
  (prev, next) => next,
  { a: '2', b: '3' }
);
orderedStringToNumberOrString = OrderedMap({ a: 1 }).mergeDeepWith(
  (prev, next) => next,
  { a: '2', b: '3' }
);
// $ExpectError - the array [1] is an invalid argument
orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeepWith(
  (prev, next) => next,
  [1]
);

// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).setIn([], 3);
// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).setIn([1], 3);
orderedStringToNumber = OrderedMap({ a: 1 }).setIn(['a'], 3);
// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).deleteIn([]);
// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).removeIn([]);
// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).deleteIn([1]);
// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).removeIn([1]);
orderedStringToNumber = OrderedMap({ a: 1 }).deleteIn(['b']);
orderedStringToNumber = OrderedMap({ a: 1 }).removeIn(['b']);

// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn([], (v) => v + 1);
// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn([1], (v) => v + 1);
// $ExpectError
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn(['a'], (v) => 'a');
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn(['a'], (v) => v + 1);
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn(['a'], 0, (v) => v + 1);

// $ExpectError
OrderedMap({ x: OrderedMap({ y: 1 }) }).updateIn(['x', 1], (v) => v + 1);
// $ExpectError
OrderedMap({ x: OrderedMap({ y: 1 }) }).updateIn(['x', 'y'], (v) => 'a');
OrderedMap({ x: OrderedMap({ y: 1 }) }).updateIn(['x', 'y'], (v) => v + 1);
OrderedMap({ x: OrderedMap({ y: 1 }) }).updateIn(['x', 'y'], 0, (v) => v + 1);

orderedStringToNumber = OrderedMap({ a: 1 }).mergeIn([], { b: 2 });
orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeepIn([], { b: 2 });
orderedStringToNumber = OrderedMap({ a: 1 }).withMutations((mutable) =>
  mutable.set('b', 2)
);
orderedStringToNumber = OrderedMap({ a: 1 }).asMutable();
orderedStringToNumber = OrderedMap({ a: 1 }).asImmutable();

orderedStringToNumber = OrderedMap({ a: 1 }).map((v) => v + 1);
// $ExpectError - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap({ a: 1 }).map(() => 'a');
orderedStringToString = OrderedMap({ a: 1 }).map(() => 'a');

orderedStringToNumber = OrderedMap({ a: 1 }).flatMap((v, k) =>
  OrderedMap({ [k]: v + 1 })
);
// $ExpectError - string "a" is not a number
orderedStringToNumber = OrderedMap({ a: 1 }).flatMap((v, k) =>
  OrderedMap({ [k]: 'a' })
);

// $ExpectError - this is actually an OrderedMap<number, string>
orderedStringToNumber = OrderedMap({ a: 1 }).flip();
orderedNumberToString = OrderedMap({ a: 1 }).flip();

orderedStringToNumber = OrderedMap({ a: 1 }).mapKeys((x) => x);
// $ExpectError - this is actually an OrderedMap<number, number>
orderedStringToNumber = OrderedMap({ a: 1 }).mapKeys((x) => 1);
orderedNumberToNumber = OrderedMap({ a: 1 }).mapKeys((x) => 1);

orderedStringToNumber = OrderedMap({ a: 1 }).flatten();
orderedStringToNumber = OrderedMap({ a: 1 }).flatten(1);
orderedStringToNumber = OrderedMap({ a: 1 }).flatten(true);
// $ExpectError - 'a' is an invalid argument
orderedStringToNumber = OrderedMap({ a: 1 }).flatten('a');

/* Set */

numberSet = Set();
numberOrStringSet = Set();
stringSet = Set();

numberSet = Set([1, 2, 3]);
// $ExpectError
numberSet = Set(['a', 'b']);

numberSet = Set.of(1, 2);
// $ExpectError
numberSet = Set.of('a', 'b');

numberSet = Set.fromKeys(Map().set(1, ''));
stringSet = Set.fromKeys({ a: '' });
// $ExpectError
numberSet = Set.fromKeys(Map({ a: 1 }));
// $ExpectError
numberSet = Set.fromKeys({ a: 1 });

numberOrStringSet = Set([1]).add('a');
// $ExpectError
numberSet = Set([1]).add('s');

numberSet = Set([1]).delete(1);
// $ExpectError
numberSet = Set([1]).delete('a');
// $ExpectError
numberSet = Set(['a']).delete('a');

numberSet = Set([1]).remove(1);
// $ExpectError
numberSet = Set([1]).remove('a');
// $ExpectError
numberSet = Set(['a']).remove('a');

numberSet = Set([1]).clear();
// $ExpectError
numberSet = Set(['a']).clear();

numberOrStringSet = Set(['a']).union([1]);
numberOrStringSet = Set(['a']).union(Set([1]));
numberSet = Set([1]).union([1]);
numberSet = Set([1]).union(Set([1]));
// $ExpectError
numberSet = Set([1]).union(['a']);
// $ExpectError
numberSet = Set([1]).union(Set(['a']));

numberOrStringSet = Set(['a']).merge([1]);
numberOrStringSet = Set(['a']).merge(Set([1]));
numberSet = Set([1]).merge([1]);
numberSet = Set([1]).merge(Set([1]));
// $ExpectError
numberSet = Set([1]).merge(['a']);
// $ExpectError
numberSet = Set([1]).merge(Set(['a']));

numberSet = Set([1]).intersect(Set([1]));
numberSet = Set([1]).intersect([1]);
numberSet = Set([1]).intersect(Set(['a']));
numberSet = Set([1]).intersect(['a']);

numberSet = Set([1]).subtract(Set([1]));
numberSet = Set([1]).subtract([1]);
numberSet = Set([1]).subtract(Set(['a']));
numberSet = Set([1]).subtract(['a']);

numberSet = Set([1]).withMutations((mutable) => mutable);
// $ExpectError
stringSet = Set([1]).withMutations((mutable) => mutable);

numberSet = Set([1]).asMutable();
// $ExpectError
stringSet = Set([1]).asMutable();

numberSet = Set([1]).asImmutable();
// $ExpectError
stringSet = Set([1]).asImmutable();

stringSet = Set([1]).map((value, index, iter) => 'a');
// $ExpectError
numberSet = Set([1]).map((value, index, iter) => 'a');

stringSet = Set([1]).flatMap((value, index, iter) => ['a']);
// $ExpectError
numberSet = Set([1]).flatMap((value, index, iter) => ['a']);

numberSet = Set([1]).flatten();

/* OrderedSet */

orderedStringSet = Set(['a']).toOrderedSet();
// $ExpectError - this is actually an OrderedSet<number>
orderedStringSet = Set([1]).toOrderedSet();
orderedNumberSet = Set([1]).toOrderedSet();

orderedStringSet = OrderedSet(['a']);
// $ExpectError - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet([1]);
orderedNumberSet = OrderedSet([1]);

orderedStringSet = OrderedSet(List.of('a'));
// $ExpectError - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet(List.of(1));
orderedNumberSet = OrderedSet(List.of(1));

orderedStringSet = OrderedSet.of('a', 'b', 'c');
// $ExpectError - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet.of(1);
orderedNumberSet = OrderedSet.of(1);

orderedStringSet = OrderedSet.fromKeys(Map({ a: 1 }));
// $ExpectError - this is actually an OrderedSet<string>
orderedNumberSet = OrderedSet.fromKeys(Map({ a: 1 }));

orderedStringSet = OrderedSet.fromKeys({ a: 1 });
// $ExpectError - this is actually an OrderedSet<string>
orderedNumberSet = OrderedSet.fromKeys({ a: 1 });

orderedStringSet = OrderedSet();

orderedStringSet = OrderedSet.of('a').add('b');
/**
 * TODO: in typescript definitions, add looks like
 *
 * ```
 * add(value: T): Set<T>
 * ```
 *
 * so we shouldn't be able to add a number to a set of strings
 */
// $ExpectError - this is actually an OrderedSet<number|string>
orderedStringSet = OrderedSet('a').add(1);
orderedNumberOrStringSet = OrderedSet('a').add(1);

orderedStringSet = OrderedSet.of('a').delete('a');
// $ExpectError - 1 is an invalid arg
orderedStringSet = OrderedSet.of('a').delete(1);

orderedStringSet = OrderedSet.of('a').remove('a');
// $ExpectError - 1 is an invalid arg
orderedStringSet = OrderedSet.of('a').remove(1);

orderedStringSet = OrderedSet.of('a').clear();

orderedStringSet = OrderedSet.of('a').union(OrderedSet.of('b'));
/**
 * TODO: typescript def looks like
 *
 * ```
 * union(...iterables: Array<T>[]): Set<T>
 * ```
 *
 * so we shouldn't be able to merge strings and numbers
 */
// $ExpectError - this is actually an OrderedSet<number|string>
orderedStringSet = OrderedSet.of('a').union(OrderedSet.of(1));
orderedNumberOrStringSet = OrderedSet.of('a').union(OrderedSet.of(1));

orderedStringSet = OrderedSet.of('a').merge(OrderedSet.of('b'));
/**
 * TODO: typescript def looks like
 *
 * ```
 * merge(...iterables: Array<T>[]): Set<T>
 * ```
 *
 * so we shouldn't be able to merge strings and numbers
 */
// $ExpectError - this is actually an OrderedSet<number|string>
orderedStringSet = OrderedSet.of('a').merge(OrderedSet.of(1));
orderedNumberOrStringSet = OrderedSet.of('a').merge(OrderedSet.of(1));

orderedStringSet = OrderedSet.of('a', 'b').intersect(OrderedSet.of('a'));
/**
 * TODO: typescript def looks like
 *
 * ```
 * intersect(...iterables: Array<T>[]): Set<T>
 * ```
 *
 * so we shouldn't be able to intersect strings and numbers
 */
orderedStringSet = OrderedSet.of('a', 'b').intersect(OrderedSet.of(1));

orderedStringSet = OrderedSet.of('a', 'b').subtract(OrderedSet.of('a'));
/**
 * TODO: typescript def looks like
 *
 * ```
 * subtract(...iterables: Array<T>[]): Set<T>
 * ```
 *
 * so we shouldn't be able to intersect strings and numbers
 */
orderedStringSet = OrderedSet.of('a', 'b').subtract(OrderedSet.of(1));

orderedStringSet = OrderedSet().withMutations((mutable) => mutable.add('a'));
orderedStringSet = OrderedSet.of('a').asMutable();
orderedStringSet = OrderedSet.of('a').asImmutable();

orderedStringSet = OrderedSet.of('a', 'b').map((m) => m);
// $ExpectError - this is an OrderedSet<number>
orderedStringSet = OrderedSet.of('a', 'b').map(() => 1);
orderedNumberSet = OrderedSet.of('a', 'b').map(() => 1);

orderedStringSet = OrderedSet.of('a', 'b').flatMap((m) => [m]);
// $ExpectError - this is an OrderedSet<number>
orderedStringSet = OrderedSet.of('a', 'b').flatMap((m) => [1]);
orderedNumberSet = OrderedSet.of('a', 'b').flatMap((m) => [1]);

orderedStringSet = OrderedSet.of('a', 'b').flatten(1);
orderedStringSet = OrderedSet.of('a', 'b').flatten(false);
// $ExpectError - invalid arg for flatten
orderedStringSet = OrderedSet.of('a', 'b').flatten('a');

/* Stack */

numberStack = Stack([1, 2]);
let numberStackSize: number = numberStack.size;
numberOrStringStack = Stack(['a', 1]);
// $ExpectError
numberStack = Stack(['a', 'b']);

numberStack = Stack.of(1, 2);
numberOrStringStack = Stack.of('a', 1);
// $ExpectError
numberStack = Stack.of('a', 1);

number = Stack([1]).peek();
// $ExpectError
number = Stack(['a']).peek();

numberStack = Stack([1]).unshift(1);
numberOrStringStack = Stack([1]).unshift('a');
// $ExpectError
numberStack = Stack([1]).unshift('a');

numberStack = Stack([1]).unshiftAll([1]);
numberOrStringStack = Stack([1]).unshiftAll(['a']);
// $ExpectError
numberStack = Stack([1]).unshiftAll(['a']);

numberStack = Stack.of(1).shift();
// $ExpectError
numberStack = Stack.of('a').shift();

numberStack = Stack().push(1);
numberOrStringStack = Stack([1]).push('a');
// $ExpectError
numberStack = Stack().push('a');

numberStack = Stack().pushAll([1]);
numberOrStringStack = Stack([1]).pushAll(['a']);
// $ExpectError
numberStack = Stack().push(['a']);

numberStack = Stack.of(1).pop();
// $ExpectError
numberStack = Stack.of('a').pop();

numberStack = Stack([1]).withMutations((mutable) => mutable);
// $ExpectError
numberStack = Stack(['a']).withMutations((mutable) => mutable);

numberStack = Stack([1]).asMutable();
// $ExpectError
numberStack = Stack(['a']).asMutable();

numberStack = Stack([1]).asImmutable();
// $ExpectError
numberStack = Stack(['a']).asImmutable();

numberStack = Stack([1]).map((value, index, iter) => 1);
// $ExpectError
numberStack = Stack([1]).map((value, index, iter) => 'a');

numberStack = Stack([1]).flatMap((value, index, iter) => [1]);
// $ExpectError
numberStack = Stack([1]).flatMap((value, index, iter) => ['a']);

numberStack = Stack([1]).flatten();
numberStack = Stack(['a']).flatten();

/* Range & Repeat */

// `{}` provide namespaces
{
  const numberSequence: IndexedSeq<number> = Range(0, 0, 0);
}
{
  const numberSequence: IndexedSeq<number> = Repeat(1, 5);
}

{
  const stringSequence: IndexedSeq<string> = Repeat('a', 5);
}
{
  // $ExpectError
  const stringSequence: IndexedSeq<string> = Repeat(0, 1);
}
{
  // $ExpectError
  const stringSequence: IndexedSeq<string> = Range(0, 0, 0);
}

/* Seq */

let numberSeq = Seq([1, 2, 3]);
// $ExpectError
let numberSeqSize: number = numberSeq.size;
let maybeNumberSeqSize: ?number = numberSeq.size;

/* Record */

type PersonRecordFields = { age: number, name: string };
type PersonRecord = RecordOf<PersonRecordFields>;
const makePersonRecord: RecordFactory<PersonRecordFields> = Record({
  age: 12,
  name: 'Facebook',
});

const personRecordInstance: PersonRecord = makePersonRecord({ age: 25 });

{
  // $ExpectError
  const age: string = personRecordInstance.get('age');
}
{
  // $ExpectError
  const age: string = personRecordInstance.age;
}
{
  const age: number = personRecordInstance.get('age');
}
{
  const age: number = personRecordInstance.age;
}

// $ExpectError
personRecordInstance.set('invalid', 25);
personRecordInstance.set('name', '25');
personRecordInstance.set('age', 33);

// FixMe: The first should be ExpectError, and the second two should be correct,
// however all three produce a hard to understand error because there is a bug
// with Flow's $Call utility type.
// set(personRecordInstance, 'invalid', 25)
// set(personRecordInstance, 'name', '25')
// set(personRecordInstance, 'age', 33)

// Create a Map from a non-prototype "plain" Object
let someObj = Object.create(null);
someObj.x = 1;
someObj.y = 2;
let mapOfSomeObj: Map<string, number> = Map(someObj);
// $ExpectError - someObj is string -> number
let mapOfSomeObjMistake: Map<string, string> = Map(someObj);

// getIn() type

// Deep nested
const deepData1: List<Map<string, string>> = List([Map([['apple', 'sauce']])]);
const deepNestedString1 = deepData1.getIn([0, 'apple']);
{
  // $ExpectError string is not a number
  const fail: ?number = deepNestedString1;
}
{
  // $ExpectError getIn can return undefined
  const fail: string = deepNestedString1;
}
{
  const success: ?string = deepNestedString1;
}

const listOfListOfNumber: List<?List<?number>> = List([List([1, 2, 3])]);
const nestedNum = listOfListOfNumber.getIn([0, 1]);
{
  // $ExpectError number is not string
  const fail: ?string = nestedNum;
}
{
  // $ExpectError getIn can return undefined
  const fail: number = nestedNum;
}
{
  const success: ?number = nestedNum;
}
// $ExpectError expected a number 1st key
listOfListOfNumber.getIn(['whoops', 1]);
// $ExpectError expected a number 2nd key
listOfListOfNumber.getIn([0, 'whoops']);
// $ExpectError too many keys!
listOfListOfNumber.getIn([0, 0, 'whoops']);

// Deep nested
const deepData: List<Map<string, List<string>>> = List([
  Map([['apple', List(['sauce'])]]),
]);
const deepNestedString = deepData.getIn([0, 'apple', 0]);
{
  // $ExpectError string is not a number
  const fail: ?number = deepNestedString;
}
{
  // $ExpectError getIn can return undefined
  const fail: string = deepNestedString;
}
{
  const success: ?string = deepNestedString;
}
// $ExpectError expected a string 2nd key
deepData.getIn([0, 0, 0]);
// $ExpectError expected a number 3rd key
deepData.getIn([0, 'apple', 'whoops']);

// Containing Records
const listOfPersonRecord: List<PersonRecord> = List([personRecordInstance]);
const firstAge = listOfPersonRecord.getIn([0, 'age']);
{
  // $ExpectError expected a string key
  const age: string = firstAge;
}
{
  // $ExpectError getIn can return undefined
  const age: number = firstAge;
}
{
  const age: ?number = firstAge;
}
// $ExpectError - the first key is not an index
listOfPersonRecord.getIn(['wrong', 'age']);
// $ExpectError - the second key is not an record key
listOfPersonRecord.getIn([0, 'mispeld']);
// $ExpectError - the second key is not an record key
listOfPersonRecord.getIn([0, 0]);
// $ExpectError
listOfPersonRecord.setIn([0, 'age'], 'Thirteen');
listOfPersonRecord.setIn([0, 'age'], 13);
// $ExpectError
listOfPersonRecord.updateIn([0, 'age'], (value) => value.unknownFunction());
listOfPersonRecord.updateIn([0, 'age'], (value) => value + 1);
listOfPersonRecord.updateIn([0, 'age'], 0, (value) => value + 1);

// Recursive Records
type PersonRecord2Fields = { name: string, friends: List<PersonRecord2> };
type PersonRecord2 = RecordOf<PersonRecord2Fields>;
const makePersonRecord2: RecordFactory<PersonRecord2Fields> = Record({
  name: 'Adam',
  friends: List(),
});
const friendly: PersonRecord2 = makePersonRecord2();
{
  // $ExpectError string is not a number
  const fail: ?number = friendly.getIn(['friends', 0, 'name']);
}
// notSetValue provided
{
  const success: string = friendly.getIn(['friends', 0, 'name'], 'Abbie');
}
{
  const success: ?string = friendly.getIn(['friends', 0, 'name']);
}

// Functional API

{
  // $ExpectError string is not a number
  const fail: ?number = getIn(friendly, ['friends', 0, 'name']);
}
// notSetValue provided
{
  const success: string = getIn(friendly, ['friends', 0, 'name'], 'Abbie');
}
{
  const success: ?string = getIn(friendly, ['friends', 0, 'name']);
}

// Deep nested containing recursive Records
const friendlies: List<PersonRecord2> = List([makePersonRecord2()]);
{
  // $ExpectError string is not a number
  const fail: ?number = friendlies.getIn([0, 'friends', 0, 'name']);
}
// notSetValue provided
{
  const success: string = friendlies.getIn([0, 'friends', 0, 'name'], 'Abbie');
}
{
  const success: ?string = friendlies.getIn([0, 'friends', 0, 'name']);
}
// $ExpectError
friendlies.setIn([0, 'friends', 0, 'name'], 123);
friendlies.setIn([0, 'friends', 0, 'name'], 'Sally');
// $ExpectError
friendlies.updateIn([0, 'friends', 0, 'name'], (value) =>
  value.unknownFunction()
);
friendlies.updateIn([0, 'friends', 0, 'name'], (value) => value.toUpperCase());
friendlies.updateIn([0, 'friends', 0, 'name'], 'Unknown Name', (value) =>
  value.toUpperCase()
);

// Nested plain JS values
type PlainPerson = { name: string, friends: Array<PlainPerson> };
const plainFriendly: PlainPerson = { name: 'Bobbie', friends: [] };
const plainFriendlies: List<PlainPerson> = List([plainFriendly]);

{
  // $ExpectError 'fraaands' is an unknown key in PlainPerson
  const fail: ?number = plainFriendlies.getIn([0, 'fraaands', 0, 'name']);
}
{
  // $ExpectError 0 is an unknown key in PlainPerson
  const fail: ?number = plainFriendlies.getIn([0, 'fraaands', 0, 0]);
}
{
  // $ExpectError string is not a number
  const fail: ?number = plainFriendlies.getIn([0, 'friends', 0, 'name']);
}
{
  // $ExpectError can return undefined
  const fail: string = plainFriendlies.getIn([0, 'friends', 0, 'name']);
}
{
  const success: ?string = plainFriendlies.getIn([0, 'friends', 0, 'name']);
}

// $ExpectError number is not a string
plainFriendlies.setIn([0, 'friends', 0, 'name'], 123);
plainFriendlies.setIn([0, 'friends', 0, 'name'], 'Morgan');

plainFriendlies.updateIn([0, 'friends', 0, 'name'], (value) =>
  // $ExpectError value is a string, this is an unknown function
  value.unknownFunction()
);
plainFriendlies.updateIn([0, 'friends', 0, 'name'], (value) =>
  value.toUpperCase()
);

// $ExpectError number is not a string
plainFriendlies.updateIn([0, 'friends', 0, 'name'], () => 123);
plainFriendlies.updateIn([0, 'friends', 0, 'name'], () => 'Whitney');

// Functional API

{
  // $ExpectError 'fraaands' is an unknown key in PlainPerson
  const fail: ?number = getIn(plainFriendlies, [0, 'fraaands', 0, 'name']);
}
{
  // $ExpectError 0 is an unknown key in PlainPerson
  const fail: ?number = getIn(plainFriendlies, [0, 'fraaands', 0, 0]);
}
{
  // $ExpectError string is not a number
  const fail: ?number = getIn(plainFriendlies, [0, 'friends', 0, 'name']);
}
{
  // $ExpectError can return undefined
  const fail: string = getIn(plainFriendlies, [0, 'friends', 0, 'name']);
}
{
  const success: ?string = getIn(plainFriendlies, [0, 'friends', 0, 'name']);
}

// $ExpectError number is not a string
setIn(plainFriendlies, [0, 'friends', 0, 'name'], 123);
setIn(plainFriendlies, [0, 'friends', 0, 'name'], 'Morgan');

updateIn(plainFriendlies, [0, 'friends', 0, 'name'], (value) =>
  // $ExpectError value is a string, this is an unknown function
  value.unknownFunction()
);
updateIn(plainFriendlies, [0, 'friends', 0, 'name'], (value) =>
  value.toUpperCase()
);

// $ExpectError number is not a string
updateIn(plainFriendlies, [0, 'friends', 0, 'name'], () => 123);
updateIn(plainFriendlies, [0, 'friends', 0, 'name'], () => 'Whitney');

// Plain JS values

{
  const success: number | void = get([1, 2, 3], 0);
}
{
  const success: number | string = get([1, 2, 3], 0, 'missing');
}
{
  // $ExpectError - string is not an array index
  const success: number = get([1, 2, 3], 'z');
}
// Note: does not return null since x is known to exist in {x,y}
{
  const success: number = get({ x: 10, y: 10 }, 'x');
}
{
  // $ExpectError - z is not in {x,y}
  const success: number | void = get({ x: 10, y: 10 }, 'z');
}
{
  const objMap: { [string]: number } = { x: 10, y: 10 };
  const success: number | void = get(objMap, 'z');
}
{
  const success: number = get({ x: 10, y: 10 }, 'x', 'missing');
}
{
  const objMap: { [string]: number } = { x: 10, y: 10 };
  const success: number | string = get(objMap, 'z', 'missing');
}

// Deeply nested records

type DeepNestFields = {
  foo: number,
};
type DeepNest = RecordOf<DeepNestFields>;
const deepNest: RecordFactory<DeepNestFields> = Record({
  foo: 0,
});

type NestFields = {
  deepNest: DeepNest,
};
type Nest = RecordOf<NestFields>;
const nest: RecordFactory<NestFields> = Record({
  deepNest: deepNest(),
});

type StateFields = {
  nest: Nest,
};
type State = RecordOf<StateFields>;
const initialState: RecordFactory<StateFields> = Record({
  nest: nest(),
});

const state = initialState();
(state.setIn(['nest', 'deepNest', 'foo'], 5): State);
// $ExpectError
(state.setIn(['nest', 'deepNest', 'foo'], 'string'): State);
// $ExpectError
(state.setIn(['nest', 'deepNest', 'unknownField'], 5): State);
