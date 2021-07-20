// @flow
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
} from 'immutable';
import * as Immutable2 from 'immutable';

import type {
  KeyedCollection,
  IndexedCollection,
  SetCollection,
  KeyedSeq,
  IndexedSeq,
  SetSeq,
  RecordFactory,
  RecordOf,
} from 'immutable';

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
// $FlowExpectedError[incompatible-call]
numberList = List(['a', 'b']);

numberList = List.of(1, 2);
numberOrStringList = List.of('a', 1);
// $FlowExpectedError[incompatible-call]
numberList = List.of('a', 1);

numberList = List().set(0, 0);
numberOrStringList = List.of(0).set(1, 'a');
// $FlowExpectedError[incompatible-call]
numberList = List().set(0, 'a');

numberList = List.of(1, 2, 3);
// $FlowExpectedError[incompatible-type]
var item: number = numberList.get(4);
var nullableItem: ?number = numberList.get(4);
var itemOrDefault: number = numberList.get(4, 10);

numberList = List().insert(0, 0);
numberOrStringList = List.of(0).insert(1, 'a');
// $FlowExpectedError[incompatible-call]
numberList = List().insert(0, 'a');

numberList = List().push(1, 1);
numberOrStringList = List().push(1, 'a');
// $FlowExpectedError[incompatible-call]
numberList = List().push(0, 'a');

numberList = List().unshift(1, 1);
numberOrStringList = List().unshift(1, 'a');
// $FlowExpectedError[incompatible-call]
numberList = List().unshift(0, 'a');

numberList = List.of(1).delete(0);
// $FlowExpectedError[incompatible-call]
numberList = List.of('a').delete(0);

numberList = List.of(1).remove(0);
// $FlowExpectedError[incompatible-call]
numberList = List.of('a').remove(0);

numberList = List.of(1).clear();
// $FlowExpectedError[incompatible-call]
numberList = List.of('a').clear();

numberList = List.of(1).pop();
// $FlowExpectedError[incompatible-call]
numberList = List.of('a').pop();

numberList = List.of(1).shift();
// $FlowExpectedError[incompatible-call]
numberList = List.of('a').shift();

numberList = List.of('a').update((value) => List.of(1));
// $FlowExpectedError[incompatible-call]
numberList = List.of(1).update((value) => List.of('a'));

numberOrStringList = List.of('a').update(0, (value) => 1);
// $FlowExpectedError[incompatible-call]
numberList = List.of(1).update(0, (value) => 'a');

numberOrStringList = List.of(1).update(1, 0, (value) => 'a');
// $FlowExpectedError[incompatible-call]
numberList = List.of(1).update(1, 0, (value) => 'a');

numberList = List.of(1).merge(List.of(2));
numberOrStringList = List.of('a').merge(List.of(1));
// $FlowExpectedError[incompatible-call]
numberList = List.of('a').merge(List.of(1));

// Functional API

numberList = merge(List([1]), List([2]));
numberOrStringList = merge(List(['a']), List([1]));
// $FlowExpectedError[incompatible-call]
numberList = merge(List(['a']), List([1]));

nullableNumberList = List.of(1).setSize(2);

// $FlowExpectedError[incompatible-type] setIn [] replaces the top-most value. number ~> List<number>
numberList = List([1]).setIn([], 0);
{
  const x: number = List([1]).setIn([], 0);
}
// $FlowExpectedError[incompatible-call] "a" is not a valid key for List.
numberList = List([1]).setIn(['a'], 0);
// $FlowExpectedError[incompatible-type-arg] "a" is not a valid value for List of number.
numberList = List([1]).setIn([0], 'a');
numberList = List([1]).setIn([0], 0);

// $FlowExpectedError[incompatible-call] "a" is not a valid key for List.
List([List([List([1])])]).setIn([0, 0, 'a'], 'a');
// $FlowExpectedError[incompatible-call] "a" is not a valid value for List of number.
List([List([List([1])])]).setIn([0, 0, 0], 'a');
List([List([List([1])])]).setIn([0, 0, 0], 123);

// $FlowExpectedError[incompatible-type] deleteIn [] replaces the top-most value. void ~> List<number>
numberList = List([1]).deleteIn([]);
{
  const x: void = List([1]).deleteIn([]);
}
// $FlowExpectedError[incompatible-type]
numberList = List([1]).removeIn([]);
// $FlowExpectedError[incompatible-call] "a" is not a valid key for List.
numberList = List([1]).deleteIn(['a']);
// $FlowExpectedError[incompatible-call]
numberList = List([1]).removeIn(['a']);
numberList = List([1]).deleteIn([0]);
numberList = List([1]).removeIn([0]);

// Functional API

// $FlowExpectedError[incompatible-type] deleteIn [] replaces the top-most value. void ~> List<number>
numberList = removeIn(List([1]), []);
{
  const x: void = removeIn(List([1]), []);
}
// $FlowExpectedError[incompatible-call] "a" is not a valid key for List.
numberList = removeIn(List([1]), ['a']);
numberList = removeIn(List([1]), [0]);

// $FlowExpectedError[incompatible-type] updateIn [] replaces the top-most value. number ~> List<number>
numberList = List([1]).updateIn([], () => 123);
{
  const x: number = List([1]).updateIn([], () => 123);
}
// $FlowExpectedError[incompatible-call] - 'a' is not a number
numberList = List([1]).updateIn([0], (val) => 'a');
// $FlowExpectedError[incompatible-call]
numberList = List([1]).updateIn([0], 0, (val) => 'a');
// $FlowExpectedError[incompatible-call] - 'a' in an invalid argument
numberList = List([1]).updateIn([0], 'a');
// $FlowExpectedError[incompatible-call]
numberList = List([1]).updateIn([0], 0, 'a');
numberList = List([1]).updateIn([0], (val) => val + 1);
numberList = List([1]).updateIn([0], 0, (val) => val + 1);

numberList = List.of(1).mergeIn([], []);
numberList = List.of(1).mergeDeepIn([], []);

numberList = List.of(1).withMutations((mutable) => mutable);

numberList = List.of(1).asMutable();
numberList = List.of(1).asImmutable();

numberList = List.of(1).map((value, index, iter) => 1);
// $FlowExpectedError[incompatible-call]
numberList = List.of(1).map((value, index, iter) => 'a');

numberList = List.of(1).flatMap((value, index, iter) => [1]);
// $FlowExpectedError[incompatible-call]
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
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 'a' });

stringToNumber = Map([['a', 1]]);
stringToNumber = Map(List([['a', 1]]));
// $FlowExpectedError[incompatible-call]
stringToNumber = Map([['a', 'b']]);
// $FlowExpectedError[incompatible-call] -- this is actually a Map<string, string>
stringToNumber = Map(List([['a', 'a']]));
// $FlowFixMe[incompatible-call] - This is Iterable<Iterable<string>>, ideally it could be interpreted as Iterable<[string, string]>
stringToNumber = Map(List([List(['a', 'a'])]));

stringOrNumberToNumberOrString = Map({ a: 'a' }).set('b', 1).set(2, 'c');
// $FlowExpectedError[incompatible-call]
stringToNumber = Map({ a: 0 }).set('b', '');
// $FlowExpectedError[incompatible-call]
stringToNumber = Map().set(1, '');

// Functional API

stringToNumber = set(set(Map({ a: 0 }), 'b', 1), 'c', 2);
// $FlowExpectedError[incompatible-call] - Functional API currently requires arguments to have the same value types.
stringOrNumberToNumberOrString = set(set(Map({ a: 'a' }), 'b', 1), 2, 'c');
// $FlowExpectedError[incompatible-call]
stringToNumber = set(Map({ a: 0 }), 'b', '');
// $FlowExpectedError[incompatible-call]
stringToNumber = set(Map(), 1, '');

stringToNumber = Map({ a: 0 }).delete('a');
stringToNumber = Map({ a: 0 }).remove('a');
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 0 }).delete(1);
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 0 }).remove(1);

stringToNumber = Map({ a: 0 }).deleteAll(['a']);
stringToNumber = Map({ a: 0 }).removeAll(['a']);
// $FlowExpectedError[prop-missing]
stringToNumber = Map({ a: 0 }).deleteAll(1);
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 0 }).deleteAll([1]);
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 0 }).removeAll([1]);

stringToNumber = Map({ a: 0 }).clear();

stringToNumber = Map({ a: 1 }).update((value) => Map({ a: 1 }));
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 1 }).update((value) => Map({ '1': 'a' }));

stringToNumberOrString = Map({ a: 1 }).update('a', (value) => 'a');
// $FlowExpectedError[incompatible-call]
stringToNumber = Map({ a: 1 }).update('a', (value) => 'a');

stringToNumberOrString = Map({ a: 1 }).update('a', 'b', (value) => 'a');
// $FlowExpectedError[incompatible-call]
stringToNumber = Map({ a: 1 }).update('a', 'b', (value) => 'a');
// $FlowExpectedError[incompatible-type-arg]
stringToNumberOrString = Map({ a: 1 }).merge({ a: { a: '1' } });
// $FlowExpectedError[incompatible-type-arg]
stringToNumberOrString = Map({ a: 1 }).update('a', 'b', (value) => {
  a: '1';
});

stringToNumber = Map({ a: 1 }).merge(Map({ a: 1 }));
stringToNumberOrString = Map({ a: 1 }).merge({ a: 'b' });
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 1 }).merge({ a: 'b' });
// $FlowExpectedError[incompatible-call]
stringToNumber = Map({ a: 1 }).merge([[1, 'a']]);
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 1 }).merge(numberToString);

// Functional API
stringToNumber = merge(Map({ a: 1 }), Map({ a: 1 }));
// $FlowExpectedError[incompatible-call] - Functional API currently requires arguments to have the same value types.
stringToNumberOrString = merge(Map({ a: 1 }), { a: 'b' });
// $FlowExpectedError[incompatible-call]
stringToNumber = merge(Map({ a: 1 }), { a: 'b' });
// $FlowExpectedError[incompatible-call]
stringToNumber = merge(Map({ a: 1 }), [[1, 'a']]);
// $FlowExpectedError[incompatible-call]
stringToNumber = merge(Map({ a: 1 }), numberToString);

stringToNumber = Map({ a: 1 }).mergeWith((previous, next, key) => 1, {
  a: 2,
  b: 2,
});
stringToNumber = Map({ a: 1 }).mergeWith(
  // $FlowExpectedError[incompatible-call]
  (previous, next, key) => previous + next,
  // $FlowExpectedError[incompatible-type-arg]
  { a: '2', b: '2' }
);
stringToNumberOrString = Map({ a: 1 }).mergeWith(
  (previous, next, key) => previous + next,
  { a: '2', b: '2' }
);
// $FlowExpectedError[incompatible-call] - the array [1] is not a valid argument
stringToNumber = Map({ a: 1 }).mergeWith((previous, next, key) => 1, [1]);

stringToNumberOrString = Map({ a: 1 }).mergeDeep({ a: 'b' });
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 1 }).mergeDeep({ a: 'b' });

stringToNumber = Map({ a: 1 }).mergeDeepWith((previous, next, key) => 1, {
  a: 2,
  b: 2,
});
stringToNumber = Map({ a: 1 }).mergeDeepWith(
  (previous, next, key) => 1,
  // $FlowExpectedError[incompatible-type-arg]
  { a: '2', b: '2' }
);
stringToNumberOrString = Map({ a: 1 }).mergeDeepWith(
  (previous, next, key) => 1,
  { a: '2', b: '2' }
);
// $FlowExpectedError[incompatible-call] - the array [1] is not a valid argument
stringToNumber = Map({ a: 1 }).mergeDeepWith((previous, next, key) => 1, [1]);

// KeyedSeq can merge into Map
var stringToStringSeq: KeyedSeq<string, string> = Seq({ b: 'B' });
stringToNumberOrString = Map({ a: 1 }).merge(stringToStringSeq);

// $FlowExpectedError[incompatible-type]
stringToNumber = Map({ a: 1 }).setIn([], 0);
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 1 }).setIn(['a'], 'a');
stringToNumber = Map({ a: 1 }).setIn(['a'], 0);

// $FlowExpectedError[incompatible-type]
stringToNumber = Map({ a: 1 }).deleteIn([]);
// $FlowExpectedError[incompatible-type]
stringToNumber = Map({ a: 1 }).removeIn([]);
stringToNumber = Map({ a: 1 }).deleteIn(['a']);
stringToNumber = Map({ a: 1 }).removeIn(['a']);

// $FlowExpectedError[incompatible-type]
Map({ a: 1 }).updateIn([], (v) => v + 1);
// $FlowExpectedError[incompatible-call]
stringToNumber = Map({ a: 1 }).updateIn(['a'], (v) => 'a');
stringToNumber = Map({ a: 1 }).updateIn(['a'], (v) => v + 1);
stringToNumber = Map({ a: 1 }).updateIn(['a'], 0, (v) => v + 1);

// $FlowExpectedError[incompatible-call]
Map({ x: Map({ y: Map({ z: 1 }) }) }).updateIn(['x', 'y', 1], (v) => v + 1);
// $FlowExpectedError[incompatible-call]
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
// $FlowExpectedError[incompatible-call]: not iterable / object
anyMap = Map({ a: {} }).mergeIn(['a'], 1);
// $FlowExpectedError[incompatible-call]: not iterable / object
anyMap = Map({ a: {} }).mergeDeepIn(['a'], 1);
// $FlowExpectedError[incompatible-type-arg]: bad key type
stringToNumber = Map({ a: {} }).mergeIn([1], { b: 2 });
// $FlowExpectedError[incompatible-type-arg]: bad key type
stringToNumber = Map({ a: {} }).mergeDeepIn([1], { b: 2 });

stringToNumber = Map({ a: 1 }).withMutations((mutable) => mutable);

stringToNumber = Map({ a: 1 }).asMutable();
stringToNumber = Map({ a: 1 }).asImmutable();

stringToNumber = Map({ a: 1 }).map((value, index, iter) => 1);
// $FlowExpectedError[incompatible-call]
stringToNumber = Map({ a: 1 }).map((value, index, iter) => 'a');

stringToNumber = Map({ a: 1 }).flatMap((value, index, iter) => [['b', 1]]);
// $FlowExpectedError[incompatible-call]
stringToNumber = Map({ a: 1 }).flatMap((value, index, iter) => [['a', 'a']]);
// $FlowExpectedError[incompatible-call]
stringToNumber = Map({ a: 1 }).flatMap((value, index, iter) => Map({ a: 'a' }));

numberToString = Map({ a: 1 }).flip();
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 1 }).flip();

numberToString = Map({ a: 'a' }).mapKeys((key, value, iter) => 1);
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = Map({ a: 1 }).mapKeys((key, value, iter) => 1);

anyMap = Map({ a: 1 }).flatten();

var stringToNullableNumber = Map({ a: 1, b: null });
// $FlowExpectedError[incompatible-type-arg]
stringToNumber = stringToNullableNumber;
// Specific type for filter(Boolean) which removes nullability.
stringToNumber = stringToNullableNumber.filter(Boolean);

/* OrderedMap */

orderedStringToNumber = Map({ a: 1 }).toOrderedMap();
// $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<string,string>
orderedStringToNumber = Map({ a: 'b' }).toOrderedMap();
orderedStringToString = Map({ a: 'b' }).toOrderedMap();

orderedStringToNumber = OrderedMap({ a: 1 });
// $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap({ a: '1' });
orderedStringToString = OrderedMap({ a: '1' });

orderedStringToNumber = OrderedMap(Map({ a: 1 }));
// $FlowExpectedError[incompatible-type-arg] - it's actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap(Map({ a: '1' }));

orderedStringToNumber = OrderedMap();

orderedStringToNumber = OrderedMap().set('b', 2);
// $FlowExpectedError[incompatible-call] - this is actually an OrderedMap<string, string>
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
orderedStringToNumber = OrderedMap({ a: 1 }).update(() =>
  // $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<string, string>
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
// $FlowExpectedError[incompatible-call] - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).update('a', () => 'b');
orderedStringToNumberOrString = OrderedMap({ a: 1 }).update('a', () => 'b');

orderedStringToNumber = OrderedMap({ a: 1 }).update(
  'a',
  0,
  (value) => value + 1
);
// $FlowExpectedError[incompatible-call] - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).update('a', 0, () => 'b');
orderedStringToNumberOrString = OrderedMap({ a: 1 }).update('a', 0, () => 'b');

orderedStringToNumber = OrderedMap({ a: 1 }).merge({ b: 2 });
// $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).merge({ b: '2' });
orderedStringToNumberOrString = OrderedMap({ a: 1 }).merge({ b: '2' });

orderedStringToNumber = OrderedMap({ a: 1 }).mergeWith(
  (prev, next) => next,
  { a: 2, b: 3 }
);
orderedStringToNumber = OrderedMap({ a: 1 }).mergeWith(
  (prev, next) => next,
  // $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<string, number|string>
  { a: '2', b: '3' }
);
orderedStringToNumberOrString = OrderedMap({ a: 1 }).mergeWith(
  (prev, next) => next,
  { a: '2', b: '3' }
);
// $FlowExpectedError[incompatible-call] - the array [1] is not a valid argument
orderedStringToNumber = OrderedMap({ a: 1 }).mergeWith((prev, next) => next, [
  1,
]);

orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeep({ a: 2 });
// $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeep({ a: '2' });
orderedStringToNumberOrString = OrderedMap({ a: 1 }).mergeDeep({ a: '2' });

orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeepWith(
  (prev, next) => next,
  { a: 2, b: 3 }
);
orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeepWith(
  (prev, next) => next,
  // $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<string, number|string>
  { a: '2', b: '3' }
);
orderedStringToNumberOrString = OrderedMap({ a: 1 }).mergeDeepWith(
  (prev, next) => next,
  { a: '2', b: '3' }
);
orderedStringToNumber = OrderedMap({ a: 1 }).mergeDeepWith(
  (prev, next) => next,
  // $FlowExpectedError[incompatible-call] - the array [1] is an invalid argument
  [1]
);

// $FlowExpectedError[incompatible-type]
orderedStringToNumber = OrderedMap({ a: 1 }).setIn([], 3);
// $FlowExpectedError[incompatible-type-arg]
orderedStringToNumber = OrderedMap({ a: 1 }).setIn([1], 3);
orderedStringToNumber = OrderedMap({ a: 1 }).setIn(['a'], 3);
// $FlowExpectedError[incompatible-type]
orderedStringToNumber = OrderedMap({ a: 1 }).deleteIn([]);
// $FlowExpectedError[incompatible-type]
orderedStringToNumber = OrderedMap({ a: 1 }).removeIn([]);
// $FlowExpectedError[incompatible-type-arg]
orderedStringToNumber = OrderedMap({ a: 1 }).deleteIn([1]);
// $FlowExpectedError[incompatible-type-arg]
orderedStringToNumber = OrderedMap({ a: 1 }).removeIn([1]);
orderedStringToNumber = OrderedMap({ a: 1 }).deleteIn(['b']);
orderedStringToNumber = OrderedMap({ a: 1 }).removeIn(['b']);

// $FlowExpectedError[incompatible-type]
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn([], (v) => v + 1);
// $FlowExpectedError[incompatible-type-arg]
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn([1], (v) => v + 1);
// $FlowExpectedError[incompatible-call]
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn(['a'], (v) => 'a');
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn(['a'], (v) => v + 1);
orderedStringToNumber = OrderedMap({ a: 1 }).updateIn(['a'], 0, (v) => v + 1);

// $FlowExpectedError[incompatible-call]
OrderedMap({ x: OrderedMap({ y: 1 }) }).updateIn(['x', 1], (v) => v + 1);
// $FlowExpectedError[incompatible-call]
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
// $FlowExpectedError[incompatible-call] - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap({ a: 1 }).map(() => 'a');
orderedStringToString = OrderedMap({ a: 1 }).map(() => 'a');

orderedStringToNumber = OrderedMap({ a: 1 }).flatMap((v, k) =>
  OrderedMap({ [k]: v + 1 })
);
orderedStringToNumber = OrderedMap({ a: 1 }).flatMap((v, k) =>
  // $FlowExpectedError[incompatible-call] - string "a" is not a number
  OrderedMap({ [k]: 'a' })
);

// $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<number, string>
orderedStringToNumber = OrderedMap({ a: 1 }).flip();
orderedNumberToString = OrderedMap({ a: 1 }).flip();

orderedStringToNumber = OrderedMap({ a: 1 }).mapKeys((x) => x);
// $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedMap<number, number>
orderedStringToNumber = OrderedMap({ a: 1 }).mapKeys((x) => 1);
orderedNumberToNumber = OrderedMap({ a: 1 }).mapKeys((x) => 1);

orderedStringToNumber = OrderedMap({ a: 1 }).flatten();
orderedStringToNumber = OrderedMap({ a: 1 }).flatten(1);
orderedStringToNumber = OrderedMap({ a: 1 }).flatten(true);
// $FlowExpectedError[incompatible-call] - 'a' is an invalid argument
orderedStringToNumber = OrderedMap({ a: 1 }).flatten('a');

/* Set */

numberSet = Set();
numberOrStringSet = Set();
stringSet = Set();

numberSet = Set([1, 2, 3]);
// $FlowExpectedError[incompatible-call]
numberSet = Set(['a', 'b']);

numberSet = Set.of(1, 2);
// $FlowExpectedError[incompatible-call]
numberSet = Set.of('a', 'b');

numberSet = Set.fromKeys(Map().set(1, ''));
stringSet = Set.fromKeys({ a: '' });
// $FlowExpectedError[incompatible-type-arg]
numberSet = Set.fromKeys(Map({ a: 1 }));
// $FlowExpectedError[incompatible-type-arg]
numberSet = Set.fromKeys({ a: 1 });

numberOrStringSet = Set([1]).add('a');
// $FlowExpectedError[incompatible-call]
numberSet = Set([1]).add('s');

numberSet = Set([1]).delete(1);
// $FlowExpectedError[incompatible-call]
numberSet = Set([1]).delete('a');
// $FlowExpectedError[incompatible-call]
numberSet = Set(['a']).delete('a');

numberSet = Set([1]).remove(1);
// $FlowExpectedError[incompatible-call]
numberSet = Set([1]).remove('a');
// $FlowExpectedError[incompatible-call]
numberSet = Set(['a']).remove('a');

numberSet = Set([1]).clear();
// $FlowExpectedError[incompatible-call]
numberSet = Set(['a']).clear();

numberOrStringSet = Set(['a']).union([1]);
numberOrStringSet = Set(['a']).union(Set([1]));
numberSet = Set([1]).union([1]);
numberSet = Set([1]).union(Set([1]));
// $FlowExpectedError[incompatible-call]
numberSet = Set([1]).union(['a']);
// $FlowExpectedError[incompatible-call]
numberSet = Set([1]).union(Set(['a']));

numberOrStringSet = Set(['a']).merge([1]);
numberOrStringSet = Set(['a']).merge(Set([1]));
numberSet = Set([1]).merge([1]);
numberSet = Set([1]).merge(Set([1]));
// $FlowExpectedError[incompatible-call]
numberSet = Set([1]).merge(['a']);
// $FlowExpectedError[incompatible-call]
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
// $FlowExpectedError[incompatible-call]
stringSet = Set([1]).withMutations((mutable) => mutable);

numberSet = Set([1]).asMutable();
// $FlowExpectedError[incompatible-call]
stringSet = Set([1]).asMutable();

numberSet = Set([1]).asImmutable();
// $FlowExpectedError[incompatible-call]
stringSet = Set([1]).asImmutable();

stringSet = Set([1]).map((value, index, iter) => 'a');
// $FlowExpectedError[incompatible-call]
numberSet = Set([1]).map((value, index, iter) => 'a');

stringSet = Set([1]).flatMap((value, index, iter) => ['a']);
// $FlowExpectedError[incompatible-call]
numberSet = Set([1]).flatMap((value, index, iter) => ['a']);

numberSet = Set([1]).flatten();

/* OrderedSet */

orderedStringSet = Set(['a']).toOrderedSet();
// $FlowExpectedError[incompatible-call] - this is actually an OrderedSet<number>
orderedStringSet = Set([1]).toOrderedSet();
orderedNumberSet = Set([1]).toOrderedSet();

orderedStringSet = OrderedSet(['a']);
// $FlowExpectedError[incompatible-call] - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet([1]);
orderedNumberSet = OrderedSet([1]);

orderedStringSet = OrderedSet(List.of('a'));
// $FlowExpectedError[incompatible-call] - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet(List.of(1));
orderedNumberSet = OrderedSet(List.of(1));

orderedStringSet = OrderedSet.of('a', 'b', 'c');
// $FlowExpectedError[incompatible-call] - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet.of(1);
orderedNumberSet = OrderedSet.of(1);

orderedStringSet = OrderedSet.fromKeys(Map({ a: 1 }));
// $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedSet<string>
orderedNumberSet = OrderedSet.fromKeys(Map({ a: 1 }));

orderedStringSet = OrderedSet.fromKeys({ a: 1 });
// $FlowExpectedError[incompatible-type-arg] - this is actually an OrderedSet<string>
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
// $FlowExpectedError[incompatible-call] - this is actually an OrderedSet<number|string>
orderedStringSet = OrderedSet('a').add(1);
orderedNumberOrStringSet = OrderedSet('a').add(1);

orderedStringSet = OrderedSet.of('a').delete('a');
// $FlowExpectedError[incompatible-call] - 1 is an invalid arg
orderedStringSet = OrderedSet.of('a').delete(1);

orderedStringSet = OrderedSet.of('a').remove('a');
// $FlowExpectedError[incompatible-call] - 1 is an invalid arg
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
// $FlowExpectedError[incompatible-call] - this is actually an OrderedSet<number|string>
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
// $FlowExpectedError[incompatible-call] - this is actually an OrderedSet<number|string>
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
// $FlowExpectedError[incompatible-call] - this is an OrderedSet<number>
orderedStringSet = OrderedSet.of('a', 'b').map(() => 1);
orderedNumberSet = OrderedSet.of('a', 'b').map(() => 1);

orderedStringSet = OrderedSet.of('a', 'b').flatMap((m) => [m]);
// $FlowExpectedError[incompatible-call] - this is an OrderedSet<number>
orderedStringSet = OrderedSet.of('a', 'b').flatMap((m) => [1]);
orderedNumberSet = OrderedSet.of('a', 'b').flatMap((m) => [1]);

orderedStringSet = OrderedSet.of('a', 'b').flatten(1);
orderedStringSet = OrderedSet.of('a', 'b').flatten(false);
// $FlowExpectedError[incompatible-call] - invalid arg for flatten
orderedStringSet = OrderedSet.of('a', 'b').flatten('a');

/* Stack */

numberStack = Stack([1, 2]);
let numberStackSize: number = numberStack.size;
numberOrStringStack = Stack(['a', 1]);
// $FlowExpectedError[incompatible-call]
numberStack = Stack(['a', 'b']);

numberStack = Stack.of(1, 2);
numberOrStringStack = Stack.of('a', 1);
// $FlowExpectedError[incompatible-call]
numberStack = Stack.of('a', 1);

number = Stack([1]).peek();
// $FlowExpectedError[incompatible-type]
number = Stack(['a']).peek();

numberStack = Stack([1]).unshift(1);
numberOrStringStack = Stack([1]).unshift('a');
// $FlowExpectedError[incompatible-call]
numberStack = Stack([1]).unshift('a');

numberStack = Stack([1]).unshiftAll([1]);
numberOrStringStack = Stack([1]).unshiftAll(['a']);
// $FlowExpectedError[incompatible-call]
numberStack = Stack([1]).unshiftAll(['a']);

numberStack = Stack.of(1).shift();
// $FlowExpectedError[incompatible-call]
numberStack = Stack.of('a').shift();

numberStack = Stack().push(1);
numberOrStringStack = Stack([1]).push('a');
// $FlowExpectedError[incompatible-call]
numberStack = Stack().push('a');

numberStack = Stack().pushAll([1]);
numberOrStringStack = Stack([1]).pushAll(['a']);
// $FlowExpectedError[incompatible-call]
numberStack = Stack().push(['a']);

numberStack = Stack.of(1).pop();
// $FlowExpectedError[incompatible-call]
numberStack = Stack.of('a').pop();

numberStack = Stack([1]).withMutations((mutable) => mutable);
// $FlowExpectedError[incompatible-call]
numberStack = Stack(['a']).withMutations((mutable) => mutable);

numberStack = Stack([1]).asMutable();
// $FlowExpectedError[incompatible-call]
numberStack = Stack(['a']).asMutable();

numberStack = Stack([1]).asImmutable();
// $FlowExpectedError[incompatible-call]
numberStack = Stack(['a']).asImmutable();

numberStack = Stack([1]).map((value, index, iter) => 1);
// $FlowExpectedError[incompatible-call]
numberStack = Stack([1]).map((value, index, iter) => 'a');

numberStack = Stack([1]).flatMap((value, index, iter) => [1]);
// $FlowExpectedError[incompatible-call]
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
  // $FlowExpectedError[incompatible-call]
  const stringSequence: IndexedSeq<string> = Repeat(0, 1);
}
{
  // $FlowExpectedError[incompatible-type-arg]
  const stringSequence: IndexedSeq<string> = Range(0, 0, 0);
}

/* Seq */

let numberSeq = Seq([1, 2, 3]);
// $FlowExpectedError[incompatible-type]
let numberSeqSize: number = numberSeq.size;
let maybeNumberSeqSize: ?number = numberSeq.size;

/* Record */

type PersonRecordFields = { age: number, name: string };
type PersonRecord = RecordOf<PersonRecordFields>;
const makePersonRecord: RecordFactory<PersonRecordFields> = Record({
  age: 900,
  name: 'Yoda',
});

const personRecordInstance: PersonRecord = makePersonRecord({ age: 25 });

{
  // $FlowExpectedError[incompatible-type]
  const age: string = personRecordInstance.get('age');
}
{
  // $FlowExpectedError[incompatible-type]
  const age: string = personRecordInstance.age;
}
{
  const age: number = personRecordInstance.get('age');
}
{
  const age: number = personRecordInstance.age;
}

// $FlowExpectedError[incompatible-call]
personRecordInstance.set('invalid', 25);
personRecordInstance.set('name', '25');
personRecordInstance.set('age', 33);

// FixMe: The first should be FlowExpectedError[incompatible-call], and the second two should be correct,
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
// $FlowExpectedError[incompatible-call] - someObj is string -> number
let mapOfSomeObjMistake: Map<string, string> = Map(someObj);

// getIn() type

// Deep nested
const deepData1: List<Map<string, string>> = List([Map([['apple', 'sauce']])]);
const deepNestedString1 = deepData1.getIn([0, 'apple']);
{
  // $FlowExpectedError[incompatible-type] string is not a number
  const fail: ?number = deepNestedString1;
}
{
  // $FlowExpectedError[incompatible-type] getIn can return undefined
  const fail: string = deepNestedString1;
}
{
  const success: ?string = deepNestedString1;
}

const listOfListOfNumber: List<?List<?number>> = List([List([1, 2, 3])]);
const nestedNum = listOfListOfNumber.getIn([0, 1]);
{
  // $FlowExpectedError[incompatible-type] number is not string
  const fail: ?string = nestedNum;
}
{
  // $FlowExpectedError[incompatible-type] getIn can return undefined
  const fail: number = nestedNum;
}
{
  const success: ?number = nestedNum;
}
// $FlowExpectedError[incompatible-call] expected a number 1st key
listOfListOfNumber.getIn(['whoops', 1]);
// $FlowExpectedError[incompatible-call] expected a number 2nd key
listOfListOfNumber.getIn([0, 'whoops']);
// $FlowExpectedError[incompatible-call] too many keys!
listOfListOfNumber.getIn([0, 0, 'whoops']);

// Deep nested
const deepData: List<Map<string, List<string>>> = List([
  Map([['apple', List(['sauce'])]]),
]);
const deepNestedString = deepData.getIn([0, 'apple', 0]);
{
  // $FlowExpectedError[incompatible-type] string is not a number
  const fail: ?number = deepNestedString;
}
{
  // $FlowExpectedError[incompatible-type] getIn can return undefined
  const fail: string = deepNestedString;
}
{
  const success: ?string = deepNestedString;
}
// $FlowExpectedError[incompatible-call] expected a string 2nd key
deepData.getIn([0, 0, 0]);
// $FlowExpectedError[incompatible-call] expected a number 3rd key
deepData.getIn([0, 'apple', 'whoops']);

// Containing Records
const listOfPersonRecord: List<PersonRecord> = List([personRecordInstance]);
const firstAge = listOfPersonRecord.getIn([0, 'age']);
{
  // $FlowExpectedError[incompatible-type] expected a string key
  const age: string = firstAge;
}
{
  // $FlowExpectedError[incompatible-type] getIn can return undefined
  const age: number = firstAge;
}
{
  const age: ?number = firstAge;
}
// $FlowExpectedError[incompatible-call] - the first key is not an index
listOfPersonRecord.getIn(['wrong', 'age']);
// $FlowExpectedError[incompatible-call] - the second key is not an record key
listOfPersonRecord.getIn([0, 'mispeld']);
// $FlowExpectedError[incompatible-call] - the second key is not an record key
listOfPersonRecord.getIn([0, 0]);
// $FlowExpectedError[incompatible-call]
listOfPersonRecord.setIn([0, 'age'], 'Thirteen');
listOfPersonRecord.setIn([0, 'age'], 13);
// $FlowExpectedError[prop-missing]
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
  // $FlowExpectedError[incompatible-type] string is not a number
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
  // $FlowExpectedError[incompatible-type] string is not a number
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
  // $FlowExpectedError[incompatible-type] string is not a number
  const fail: ?number = friendlies.getIn([0, 'friends', 0, 'name']);
}
// notSetValue provided
{
  const success: string = friendlies.getIn([0, 'friends', 0, 'name'], 'Abbie');
}
{
  const success: ?string = friendlies.getIn([0, 'friends', 0, 'name']);
}
// $FlowExpectedError[incompatible-call]
friendlies.setIn([0, 'friends', 0, 'name'], 123);
friendlies.setIn([0, 'friends', 0, 'name'], 'Sally');
// $FlowExpectedError[prop-missing]
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
  // $FlowExpectedError[incompatible-call] 'fraaands' is an unknown key in PlainPerson
  const fail: ?number = plainFriendlies.getIn([0, 'fraaands', 0, 'name']);
}
{
  // $FlowExpectedError[incompatible-call] 0 is an unknown key in PlainPerson
  const fail: ?number = plainFriendlies.getIn([0, 'fraaands', 0, 0]);
}
{
  // $FlowExpectedError[incompatible-call] string is not a number
  const fail: ?number = plainFriendlies.getIn([0, 'friends', 0, 'name']);
}
{
  // $FlowExpectedError[incompatible-call] can return undefined
  const fail: string = plainFriendlies.getIn([0, 'friends', 0, 'name']);
}
{
  const success: ?string = plainFriendlies.getIn([0, 'friends', 0, 'name']);
}

// $FlowExpectedError[incompatible-call] number is not a string
plainFriendlies.setIn([0, 'friends', 0, 'name'], 123);
plainFriendlies.setIn([0, 'friends', 0, 'name'], 'Morgan');

plainFriendlies.updateIn([0, 'friends', 0, 'name'], (value) =>
  // $FlowExpectedError[incompatible-call] value is a string, this is an unknown function
  value.unknownFunction()
);
plainFriendlies.updateIn([0, 'friends', 0, 'name'], (value) =>
  value.toUpperCase()
);

// $FlowExpectedError[incompatible-call] number is not a string
plainFriendlies.updateIn([0, 'friends', 0, 'name'], () => 123);
plainFriendlies.updateIn([0, 'friends', 0, 'name'], () => 'Whitney');

// Functional API

{
  // $FlowExpectedError[incompatible-call] 'fraaands' is an unknown key in PlainPerson
  const fail: ?number = getIn(plainFriendlies, [0, 'fraaands', 0, 'name']);
}
{
  // $FlowExpectedError[incompatible-call] 0 is an unknown key in PlainPerson
  const fail: ?number = getIn(plainFriendlies, [0, 'fraaands', 0, 0]);
}
{
  // $FlowExpectedError[incompatible-type] string is not a number
  const fail: ?number = getIn(plainFriendlies, [0, 'friends', 0, 'name']);
}
{
  // $FlowExpectedError[incompatible-type] can return undefined
  const fail: string = getIn(plainFriendlies, [0, 'friends', 0, 'name']);
}
{
  const success: ?string = getIn(plainFriendlies, [0, 'friends', 0, 'name']);
}

// $FlowExpectedError[incompatible-call] number is not a string
setIn(plainFriendlies, [0, 'friends', 0, 'name'], 123);
setIn(plainFriendlies, [0, 'friends', 0, 'name'], 'Morgan');

updateIn(plainFriendlies, [0, 'friends', 0, 'name'], (value) =>
  // $FlowExpectedError[prop-missing] value is a string, this is an unknown function
  value.unknownFunction()
);
updateIn(plainFriendlies, [0, 'friends', 0, 'name'], (value) =>
  value.toUpperCase()
);

// $FlowExpectedError[incompatible-call] number is not a string
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
  // $FlowExpectedError[incompatible-call] - string is not an array index
  const success: number = get([1, 2, 3], 'z');
}
// Note: does not return null since x is known to exist in {x,y}
{
  const success: number = get({ x: 10, y: 10 }, 'x');
}
{
  // $FlowExpectedError[incompatible-call] - z is not in {x,y}
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
// $FlowExpectedError[incompatible-call]
(state.setIn(['nest', 'deepNest', 'foo'], 'string'): State);
// $FlowExpectedError[incompatible-call]
(state.setIn(['nest', 'deepNest', 'unknownField'], 5): State);
