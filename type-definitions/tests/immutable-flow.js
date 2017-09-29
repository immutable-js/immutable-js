/*
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
} from '../../'
import * as Immutable2 from '../../'

import type {
  KeyedCollection,
  IndexedCollection,
  RecordInstance,
  SetCollection,
  KeyedSeq,
  IndexedSeq,
  SetSeq,
} from '../../'

/**
 * Although this looks like dead code, importing `Immutable` and
 * `Immutable2` tests:
 *
 * 1. that default import works -- `import Immutable, {...} from 'immutable'
 * 2. that importing everything works -- `import * as X from 'immutable'`
 * 3. that individual imports are supported
 */
const ImmutableList = Immutable.List
const ImmutableMap = Immutable.Map
const ImmutableStack = Immutable.Stack
const ImmutableSet = Immutable.Set
const ImmutableKeyedCollection: KeyedCollection<*, *> = Immutable.Collection.Keyed()
const ImmutableRange = Immutable.Range
const ImmutableRepeat = Immutable.Repeat
const ImmutableIndexedSeq: IndexedSeq<*> = Immutable.Seq.Indexed()

const Immutable2List = Immutable2.List
const Immutable2Map = Immutable2.Map
const Immutable2Stack = Immutable2.Stack
const Immutable2Set = Immutable2.Set
const Immutable2KeyedCollection: Immutable2.KeyedCollection<*, *> = Immutable2.Collection.Keyed()
const Immutable2Range = Immutable2.Range
const Immutable2Repeat = Immutable2.Repeat
const Immutable2IndexedSeq: Immutable2.IndexedSeq<*> = Immutable2.Seq.Indexed()

var defaultExport: List<*> = Immutable.List();
var moduleExport: List<*> = Immutable2.List();

var numberList: List<number> = List()
var numberOrStringList: List<string | number> = List()
var nullableNumberList: List<?number> = List()
var stringToNumber: Map<string, number> = Map()
var orderedStringToNumber: OrderedMap<string, number> = OrderedMap()
var orderedStringToString: OrderedMap<string, string> = OrderedMap()
var orderedStringToNumberOrString: OrderedMap<string, string | number> = OrderedMap()
var orderedNumberToString: OrderedMap<number, string> = OrderedMap()
var orderedNumberToNumber: OrderedMap<number, number> = OrderedMap()
var stringToNumberOrString: Map<string, string | number> = Map()
var numberToString: Map<number, string> = Map()
var stringOrNumberToNumberOrString: Map<string | number, string | number> = Map()
var anyMap: Map<any, any> = Map()
var numberSet: Set<number> = Set()
var orderedStringSet: OrderedSet<string> = OrderedSet()
var orderedNumberSet: OrderedSet<number> = OrderedSet()
var orderedNumberOrStringSet: OrderedSet<string | number> = OrderedSet()
var numberOrStringSet: Set<number | string> = Set()
var stringSet: Set<string> = Set()
var numberStack: Stack<number> = Stack()
var numberOrStringStack: Stack<string | number> = Stack()
var number: number = 0
var stringToNumberCollection: KeyedCollection<string, number> = stringToNumber
var numberToStringCollection: KeyedCollection<number, string> = numberToString

numberList = List([1, 2])
var numberListSize: number = numberList.size;
numberOrStringList = List(['a', 1])
// $ExpectError
numberList = List(['a', 'b'])

numberList = List.of(1, 2)
numberOrStringList = List.of('a', 1)
// $ExpectError
numberList = List.of('a', 1)

numberList = List().set(0, 0)
numberOrStringList = List.of(0).set(1, 'a')
// $ExpectError
numberList = List().set(0, 'a')

numberList = List.of(1, 2, 3)
// $ExpectError
var item: number = numberList.get(4)
var nullableItem: ?number = numberList.get(4)
var itemOrDefault: number = numberList.get(4, 10)

numberList = List().insert(0, 0)
numberOrStringList = List.of(0).insert(1, 'a')
// $ExpectError
numberList = List().insert(0, 'a')

numberList = List().push(1, 1)
numberOrStringList = List().push(1, 'a')
// $ExpectError
numberList = List().push(0, 'a')

numberList = List().unshift(1, 1)
numberOrStringList = List().unshift(1, 'a')
// $ExpectError
numberList = List().unshift(0, 'a')

numberList = List.of(1).delete(0)
// $ExpectError
numberList = List.of('a').delete(0)

numberList = List.of(1).remove(0)
// $ExpectError
numberList = List.of('a').remove(0)

numberList = List.of(1).clear()
// $ExpectError
numberList = List.of('a').clear()

numberList = List.of(1).pop()
// $ExpectError
numberList = List.of('a').pop()

numberList = List.of(1).shift()
// $ExpectError
numberList = List.of('a').shift()

numberList = List.of('a').update((value) => List.of(1))
// $ExpectError
numberList = List.of(1).update((value) => List.of('a'))

numberOrStringList = List.of('a').update(0, (value) => 1)
// $ExpectError
numberList = List.of(1).update(0, (value) => 'a')

numberOrStringList = List.of(1).update(1, 0, (value) => 'a')
// $ExpectError
numberList = List.of(1).update(1, 0, (value) => 'a')

numberList = List.of(1).merge(List.of(2))
numberOrStringList = List.of('a').merge(List.of(1))
// $ExpectError
numberList = List.of('a').merge(List.of(1))

numberList = List.of(1).mergeWith((previous, next, key) => 1, [1])
// $ExpectError
numberList = List.of(1).mergeWith((previous, next, key) => previous + next, ['a'])

numberOrStringList = List.of(1).mergeDeep(['a'])
// $ExpectError
numberList = List.of(1).mergeDeep(['a'])

numberList = List.of(1).mergeDeepWith((previous, next, key) => 1, [1])
// $ExpectError
numberList = List.of(1).mergeDeepWith((previous, next, key) => previous + next, ['a'])

nullableNumberList = List.of(1).setSize(2)

numberList = List.of(1).setIn([], 0)

numberList = List.of(1).deleteIn([], 0)
numberList = List.of(1).removeIn([], 0)

numberList = List([1]).updateIn([0], val => val + 1)
// $ExpectError - 'a' in an invalid argument
numberList = List([1]).updateIn([0], 'a')

numberList = List([1]).updateIn([0], 0, val => val + 1)
// $ExpectError - 'a' is an invalid argument
numberList = List([1]).updateIn([0], 0, 'a')

numberList = List.of(1).mergeIn([], [])
numberList = List.of(1).mergeDeepIn([], [])

numberList = List.of(1).withMutations(mutable => mutable)

numberList = List.of(1).asMutable()
numberList = List.of(1).asImmutable()

numberList = List.of(1).map((value, index, iter) => 1)
// $ExpectError
numberList = List.of(1).map((value, index, iter) => 'a')

numberList = List.of(1).flatMap((value, index, iter) => [1])
// $ExpectError
numberList = List.of(1).flatMap((value, index, iter) => ['a'])

numberList = List.of(1).flatten()

/* Map */

stringToNumber = Map()
let stringToNumberSize: number = stringToNumber.size
stringToNumberOrString = Map()
numberToString = Map()

stringToNumber = Map({'a': 1})
// $ExpectError
stringToNumber = Map({'a': 'a'})

stringToNumber = Map([['a', 1]])
// $ExpectError
stringToNumber = Map([['a', 'b']])
// FIXME: this should trigger an error -- this is actually a Map<string, string>
stringToNumber = Map(List.of(List(['a', 'b'])))

stringOrNumberToNumberOrString = Map({'a': 'a'}).set('b', 1).set(2, 'c')
// $ExpectError
stringToNumber = Map({'a': 0}).set('b', '')
// $ExpectError
stringToNumber = Map().set(1, '')

stringToNumber = Map({'a': 0}).delete('a')
stringToNumber = Map({'a': 0}).remove('a')
// $ExpectError
stringToNumber = Map({'a': 0}).delete(1)
// $ExpectError
stringToNumber = Map({'a': 0}).remove(1)

stringToNumber = Map({'a': 0}).deleteAll(['a'])
stringToNumber = Map({'a': 0}).removeAll(['a'])
// $ExpectError
stringToNumber = Map({'a': 0}).deleteAll(1)
// $ExpectError
stringToNumber = Map({'a': 0}).deleteAll([1])
// $ExpectError
stringToNumber = Map({'a': 0}).removeAll([1])

stringToNumber = Map({'a': 0}).clear()

stringToNumber = Map({'a': 1}).update((value) => Map({'a': 1}))
// $ExpectError
stringToNumber = Map({'a': 1}).update((value) => Map({1: 'a'}))

stringToNumberOrString = Map({'a': 1}).update('a', (value) => 'a')
// $ExpectError
stringToNumber = Map({'a': 1}).update('a', (value) => 'a')

stringToNumberOrString = Map({'a': 1}).update('a', 'b', (value) => 'a')
// $ExpectError
stringToNumber = Map({'a': 1}).update('a', 'b', (value) => 'a')
// $ExpectError
stringToNumberOrString = Map({'a': 1}).merge({'a': {a: '1'}})
// $ExpectError
stringToNumberOrString = Map({'a': 1}).update('a', 'b', (value) => {a: '1'})

stringToNumber = Map({'a': 1}).merge(Map({'a': 1}))
stringToNumberOrString = Map({'a': 1}).merge({'a': 'b'})
// $ExpectError
stringToNumber = Map({a: 1}).merge({'a': 'b'})
// $ExpectError
stringToNumber = Map({a: 1}).merge([[1, 'a']])

// FIXME: Simple `stringToNumber = ...` assignment shows an error at the declaration of stringToNumber and numberToString
// $ExpectError
const stringToNumber: Map<string, number> = Map({a: 1}).merge(numberToString)

stringToNumber = Map({'a': 1}).mergeWith((previous, next, key) => 1, {'a': 2, 'b': 2})
// $ExpectError - this is actually a Map<string, number|string>
stringToNumber = Map({'a': 1}).mergeWith((previous, next, key) => previous + next, {'a': '2', 'b': '2'})
stringToNumberOrString = Map({'a': 1}).mergeWith((previous, next, key) => previous + next, {'a': '2', 'b': '2'})
// $ExpectError - the array [1] is not a valid argument
stringToNumber = Map({'a': 1}).mergeWith((previous, next, key) => 1, [1])

stringToNumberOrString = Map({'a': 1}).mergeDeep({'a': 'b'})
// $ExpectError
stringToNumber = Map({'a': 1}).mergeDeep({'a': 'b'})

stringToNumber = Map({'a': 1}).mergeDeepWith((previous, next, key) => 1, {'a': 2, 'b': 2})
// $ExpectError - this is actually a Map<string, number|string>
stringToNumber = Map({'a': 1}).mergeDeepWith((previous, next, key) => 1, {'a': '2', 'b': '2'})
stringToNumberOrString = Map({'a': 1}).mergeDeepWith((previous, next, key) => 1, {'a': '2', 'b': '2'})
// $ExpectError - the array [1] is not a valid argument
stringToNumber = Map({'a': 1}).mergeDeepWith((previous, next, key) => 1, [1])

stringToNumber = Map({'a': 1}).setIn([], 0)

stringToNumber = Map({'a': 1}).deleteIn([], 0)
stringToNumber = Map({'a': 1}).removeIn([], 0)

stringToNumber = Map({'a': 1}).mergeIn([], [])
stringToNumber = Map({'a': 1}).mergeDeepIn([], [])

anyMap = Map({'a': {}}).mergeIn(['a'], Map({ 'b': 2 }))
anyMap = Map({'a': {}}).mergeDeepIn(['a'], Map({ 'b': 2 }))
anyMap = Map({'a': {}}).mergeIn(['a'], List([1, 2]))
anyMap = Map({'a': {}}).mergeDeepIn(['a'], List([1, 2]))
anyMap = Map({'a': {}}).mergeIn(['a'], { 'b': 2 })
anyMap = Map({'a': {}}).mergeDeepIn(['a'], { 'b': 2 })
// $ExpectError: not iterable / object
anyMap = Map({'a': {}}).mergeIn(['a'], 1)
// $ExpectError: not iterable / object
anyMap = Map({'a': {}}).mergeDeepIn(['a'], 1)
// $ExpectError: bad key type
stringToNumber = Map({'a': {}}).mergeIn([1], { 'b': 2 })
// $ExpectError: bad key type
stringToNumber = Map({'a': {}}).mergeDeepIn([1], { 'b': 2 })

stringToNumber = Map({'a': 1}).withMutations(mutable => mutable)

stringToNumber = Map({'a': 1}).asMutable()
stringToNumber = Map({'a': 1}).asImmutable()

stringToNumber = Map({'a': 1}).map((value, index, iter) => 1)
// $ExpectError
stringToNumber = Map({'a': 1}).map((value, index, iter) => 'a')

stringToNumber = Map({'a': 1}).flatMap((value, index, iter) => [['b', 1]])
// $ExpectError
stringToNumber = Map({'a': 1}).flatMap((value, index, iter) => [['a', 'a']])
// $ExpectError
stringToNumber = Map({'a': 1}).flatMap((value, index, iter) => Map({'a': 'a'}))

numberToString= Map({'a': 1}).flip()
// $ExpectError
stringToNumber = Map({'a': 1}).flip()

numberToString = Map({'a': 'a'}).mapKeys((key, value, iter) => 1)
// $ExpectError
stringToNumber = Map({'a': 1}).mapKeys((key, value, iter) => 1)

anyMap = Map({'a': 1}).flatten()

/* OrderedMap */

orderedStringToNumber = Map({'a': 1}).toOrderedMap()
// $ExpectError - this is actually an OrderedMap<string,string>
orderedStringToNumber = Map({'a': 'b'}).toOrderedMap()
orderedStringToString = Map({'a': 'b'}).toOrderedMap()

orderedStringToNumber = OrderedMap({'a': 1})
// $ExpectError - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap({'a': '1'})
orderedStringToString = OrderedMap({'a': '1'})

orderedStringToNumber = OrderedMap(Map({'a': 1}))
// FIXME: this should trigger an error -- it's actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap(Map({'a': '1'}))

orderedStringToNumber = OrderedMap()

orderedStringToNumber = OrderedMap().set('b', 2)
// $ExpectError - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap().set('b', '2')
orderedStringToString = OrderedMap().set('b', '2')

orderedStringToNumber = OrderedMap({'a': 1}).delete('a')
orderedStringToNumber = OrderedMap({'a': 1}).remove('a')
orderedStringToNumber = OrderedMap({'a': 1}).clear()

orderedStringToNumber = OrderedMap({'a': 1}).update(() => OrderedMap({'b': 1}))
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
orderedStringToNumber = OrderedMap({'a': 1}).update(() => OrderedMap({'b': '1'}))
orderedStringToString = OrderedMap({'a': 1}).update(() => OrderedMap({'b': '1'}))

orderedStringToNumber = OrderedMap({'a': 1}).update('a', value => value + 1)
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
orderedStringToNumber = OrderedMap({'a': 1}).update('a', () => 'b')
orderedStringToNumberOrString = OrderedMap({'a': 1}).update('a', () => 'b')

orderedStringToNumber = OrderedMap({'a': 1}).update('a', 0, value => value + 1)
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({'a': 1}).update('a', 0, () => 'b')
orderedStringToNumberOrString = OrderedMap({'a': 1}).update('a', 0, () => 'b')

orderedStringToNumber = OrderedMap({'a': 1}).merge({'b': 2})
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({'a': 1}).merge({'b': '2'})
orderedStringToNumberOrString = OrderedMap({'a': 1}).merge({'b': '2'})

orderedStringToNumber = OrderedMap({'a': 1}).mergeWith((prev, next) => next, {'a': 2, 'b': 3})
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({'a': 1}).mergeWith((prev, next) => next, {'a': '2', 'b': '3'})
orderedStringToNumberOrString = OrderedMap({'a': 1}).mergeWith((prev, next) => next, {'a': '2', 'b': '3'})
// $ExpectError - the array [1] is not a valid argument
orderedStringToNumber = OrderedMap({'a': 1}).mergeWith((prev, next) => next, [1])

orderedStringToNumber = OrderedMap({'a': 1}).mergeDeep({'a': 2})
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({'a': 1}).mergeDeep({'a': '2'})
orderedStringToNumberOrString = OrderedMap({'a': 1}).mergeDeep({'a': '2'})

orderedStringToNumber = OrderedMap({'a': 1}).mergeDeepWith((prev, next) => next, {'a': 2, 'b': 3})
// $ExpectError - this is actually an OrderedMap<string, number|string>
orderedStringToNumber = OrderedMap({'a': 1}).mergeDeepWith((prev, next) => next, {'a': '2', 'b': '3'})
orderedStringToNumberOrString = OrderedMap({'a': 1}).mergeDeepWith((prev, next) => next, {'a': '2', 'b': '3'})
// $ExpectError - the array [1] is an invalid argument
orderedStringToNumber = OrderedMap({'a': 1}).mergeDeepWith((prev, next) => next, [1])

orderedStringToNumber = OrderedMap({'a': 1}).setIn([], 3)
orderedStringToNumber = OrderedMap({'a': 1}).deleteIn([])
orderedStringToNumber = OrderedMap({'a': 1}).removeIn([])

orderedStringToNumber = OrderedMap({'a': 1}).updateIn([], val => val + 1)
// $ExpectError - 'a' in an invalid argument
orderedStringToNumber = OrderedMap({'a': 1}).updateIn([], 'a')

orderedStringToNumber = OrderedMap({'a': 1}).updateIn([], 0, val => val + 1)
// $ExpectError - 'a' is an invalid argument
orderedStringToNumber = OrderedMap({'a': 1}).updateIn([], 0, 'a')

orderedStringToNumber = OrderedMap({'a': 1}).mergeIn([], {'b': 2})
orderedStringToNumber = OrderedMap({'a': 1}).mergeDeepIn([], {'b': 2})
orderedStringToNumber = OrderedMap({'a': 1}).withMutations(mutable => mutable.set('b', 2))
orderedStringToNumber = OrderedMap({'a': 1}).asMutable();
orderedStringToNumber = OrderedMap({'a': 1}).asImmutable();

orderedStringToNumber = OrderedMap({'a': 1}).map(v => v + 1)
// $ExpectError - this is actually an OrderedMap<string, string>
orderedStringToNumber = OrderedMap({'a': 1}).map(() => 'a')
orderedStringToString = OrderedMap({'a': 1}).map(() => 'a')

orderedStringToNumber = OrderedMap({'a': 1}).flatMap((v, k) => (OrderedMap({ [k]: v + 1 })))
/**
 * FIXME: this should throw an error, it's an OrderedMap<string, string>
 */
orderedStringToNumber = OrderedMap({'a': 1}).flatMap((v, k) => (OrderedMap({ [k]: 'a' })))

// $ExpectError - this is actually an OrderedMap<number, string>
orderedStringToNumber = OrderedMap({'a': 1}).flip()
orderedNumberToString = OrderedMap({'a': 1}).flip()

orderedStringToNumber = OrderedMap({'a': 1}).mapKeys(x => x)
// $ExpectError - this is actually an OrderedMap<number, number>
orderedStringToNumber = OrderedMap({'a': 1}).mapKeys(x => 1)
orderedNumberToNumber = OrderedMap({'a': 1}).mapKeys(x => 1)

orderedStringToNumber = OrderedMap({'a': 1}).flatten()
orderedStringToNumber = OrderedMap({'a': 1}).flatten(1)
orderedStringToNumber = OrderedMap({'a': 1}).flatten(true)
// $ExpectError - 'a' is an invalid argument
orderedStringToNumber = OrderedMap({'a': 1}).flatten('a')

/* Set */

numberSet = Set()
numberOrStringSet = Set()
stringSet = Set()

numberSet = Set([1, 2, 3])
// $ExpectError
numberSet = Set(['a', 'b'])

numberSet = Set.of(1, 2)
// $ExpectError
numberSet = Set.of('a', 'b')

numberSet = Set.fromKeys(Map().set(1, ''))
stringSet = Set.fromKeys({a: ''})
// $ExpectError
numberSet = Set.fromKeys(Map({'a': 1}))
// $ExpectError
numberSet = Set.fromKeys({'a': 1})

numberOrStringSet = Set([1]).add('a')
// $ExpectError
numberSet = Set([1]).add('s')

numberSet = Set([1]).delete(1)
// $ExpectError
numberSet = Set([1]).delete('a')
// $ExpectError
numberSet = Set(['a']).delete('a')

numberSet = Set([1]).remove(1)
// $ExpectError
numberSet = Set([1]).remove('a')
// $ExpectError
numberSet = Set(['a']).remove('a')

numberSet = Set([1]).clear()
// $ExpectError
numberSet = Set(['a']).clear()

numberOrStringSet = Set(['a']).union([1])
numberOrStringSet = Set(['a']).union(Set([1]))
numberSet = Set([1]).union([1])
numberSet = Set([1]).union(Set([1]))
// $ExpectError
numberSet = Set([1]).union(['a'])
// $ExpectError
numberSet = Set([1]).union(Set(['a']))

numberOrStringSet = Set(['a']).merge([1])
numberOrStringSet = Set(['a']).merge(Set([1]))
numberSet = Set([1]).merge([1])
numberSet = Set([1]).merge(Set([1]))
// $ExpectError
numberSet = Set([1]).merge(['a'])
// $ExpectError
numberSet = Set([1]).merge(Set(['a']))

numberSet = Set([1]).intersect(Set([1]))
numberSet = Set([1]).intersect([1])
numberSet = Set([1]).intersect(Set(['a']))
numberSet = Set([1]).intersect(['a'])

numberSet = Set([1]).subtract(Set([1]))
numberSet = Set([1]).subtract([1])
numberSet = Set([1]).subtract(Set(['a']))
numberSet = Set([1]).subtract(['a'])

numberSet = Set([1]).withMutations(mutable => mutable)
// $ExpectError
stringSet = Set([1]).withMutations(mutable => mutable)

numberSet = Set([1]).asMutable()
// $ExpectError
stringSet = Set([1]).asMutable()

numberSet = Set([1]).asImmutable()
// $ExpectError
stringSet = Set([1]).asImmutable()

stringSet = Set([1]).map((value, index, iter) => 'a')
// $ExpectError
numberSet = Set([1]).map((value, index, iter) => 'a')

stringSet = Set([1]).flatMap((value, index, iter) => ['a'])
// $ExpectError
numberSet = Set([1]).flatMap((value, index, iter) => ['a'])

numberSet = Set([1]).flatten()

/* OrderedSet */

orderedStringSet = Set(['a']).toOrderedSet()
// $ExpectError - this is actually an OrderedSet<number>
orderedStringSet = Set([1]).toOrderedSet()
orderedNumberSet = Set([1]).toOrderedSet()

orderedStringSet = OrderedSet(['a'])
// $ExpectError - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet([1])
orderedNumberSet = OrderedSet([1])

orderedStringSet = OrderedSet(List.of('a'))
// $ExpectError - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet(List.of(1))
orderedNumberSet = OrderedSet(List.of(1))

orderedStringSet = OrderedSet.of('a', 'b', 'c')
// $ExpectError - this is actually an OrderedSet<number>
orderedStringSet = OrderedSet.of(1)
orderedNumberSet = OrderedSet.of(1)

orderedStringSet = OrderedSet.fromKeys(Map({'a': 1}))
// $ExpectError - this is actually an OrderedSet<string>
orderedNumberSet = OrderedSet.fromKeys(Map({'a': 1}))

orderedStringSet = OrderedSet.fromKeys({ 'a': 1 })
// $ExpectError - this is actually an OrderedSet<string>
orderedNumberSet = OrderedSet.fromKeys({ 'a': 1 })

orderedStringSet = OrderedSet()

orderedStringSet = OrderedSet.of('a').add('b')
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
orderedStringSet = OrderedSet('a').add(1)
orderedNumberOrStringSet = OrderedSet('a').add(1)

orderedStringSet = OrderedSet.of('a').delete('a')
// $ExpectError - 1 is an invalid arg
orderedStringSet = OrderedSet.of('a').delete(1)

orderedStringSet = OrderedSet.of('a').remove('a')
// $ExpectError - 1 is an invalid arg
orderedStringSet = OrderedSet.of('a').remove(1)

orderedStringSet = OrderedSet.of('a').clear()

orderedStringSet = OrderedSet.of('a').union(OrderedSet.of('b'))
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
orderedStringSet = OrderedSet.of('a').union(OrderedSet.of(1))
orderedNumberOrStringSet = OrderedSet.of('a').union(OrderedSet.of(1))

orderedStringSet = OrderedSet.of('a').merge(OrderedSet.of('b'))
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
orderedStringSet = OrderedSet.of('a').merge(OrderedSet.of(1))
orderedNumberOrStringSet = OrderedSet.of('a').merge(OrderedSet.of(1))

orderedStringSet = OrderedSet.of('a', 'b').intersect(OrderedSet.of('a'))
/**
 * TODO: typescript def looks like
 *
 * ```
 * intersect(...iterables: Array<T>[]): Set<T>
 * ```
 *
 * so we shouldn't be able to intersect strings and numbers
 */
orderedStringSet = OrderedSet.of('a', 'b').intersect(OrderedSet.of(1))

orderedStringSet = OrderedSet.of('a', 'b').subtract(OrderedSet.of('a'))
/**
 * TODO: typescript def looks like
 *
 * ```
 * subtract(...iterables: Array<T>[]): Set<T>
 * ```
 *
 * so we shouldn't be able to intersect strings and numbers
 */
orderedStringSet = OrderedSet.of('a', 'b').subtract(OrderedSet.of(1))

orderedStringSet = OrderedSet().withMutations(mutable => mutable.add('a'))
orderedStringSet = OrderedSet.of('a').asMutable()
orderedStringSet = OrderedSet.of('a').asImmutable()

orderedStringSet = OrderedSet.of('a', 'b').map(m => m)
// $ExpectError - this is an OrderedSet<number>
orderedStringSet = OrderedSet.of('a', 'b').map(() => 1)
orderedNumberSet = OrderedSet.of('a', 'b').map(() => 1)

orderedStringSet = OrderedSet.of('a', 'b').flatMap(m => [m])
// $ExpectError - this is an OrderedSet<number>
orderedStringSet = OrderedSet.of('a', 'b').flatMap(m => [1])
orderedNumberSet = OrderedSet.of('a', 'b').flatMap(m => [1])

orderedStringSet = OrderedSet.of('a', 'b').flatten(1)
orderedStringSet = OrderedSet.of('a', 'b').flatten(false)
// $ExpectError - invalid arg for flatten
orderedStringSet = OrderedSet.of('a', 'b').flatten('a')

/* Stack */

numberStack = Stack([1, 2])
let numberStackSize: number = numberStack.size;
numberOrStringStack = Stack(['a', 1])
// $ExpectError
numberStack = Stack(['a', 'b'])

numberStack = Stack.of(1, 2)
numberOrStringStack = Stack.of('a', 1)
// $ExpectError
numberStack = Stack.of('a', 1)

number = Stack([1]).peek()
// $ExpectError
number = Stack(['a']).peek()

numberStack = Stack([1]).unshift(1)
numberOrStringStack = Stack([1]).unshift('a')
// $ExpectError
numberStack = Stack([1]).unshift('a')

numberStack = Stack([1]).unshiftAll([1])
numberOrStringStack = Stack([1]).unshiftAll(['a'])
// $ExpectError
numberStack = Stack([1]).unshiftAll(['a'])

numberStack = Stack.of(1).shift()
// $ExpectError
numberStack = Stack.of('a').shift()

numberStack = Stack().push(1)
numberOrStringStack = Stack([1]).push('a')
// $ExpectError
numberStack = Stack().push('a')

numberStack = Stack().pushAll([1])
numberOrStringStack = Stack([1]).pushAll(['a'])
// $ExpectError
numberStack = Stack().push(['a'])

numberStack = Stack.of(1).pop()
// $ExpectError
numberStack = Stack.of('a').pop()

numberStack = Stack([1]).withMutations(mutable => mutable)
// $ExpectError
numberStack = Stack(['a']).withMutations(mutable => mutable)

numberStack = Stack([1]).asMutable()
// $ExpectError
numberStack = Stack(['a']).asMutable()

numberStack = Stack([1]).asImmutable()
// $ExpectError
numberStack = Stack(['a']).asImmutable()

numberStack = Stack([1]).map((value, index, iter) => 1)
// $ExpectError
numberStack = Stack([1]).map((value, index, iter) => 'a')

numberStack = Stack([1]).flatMap((value, index, iter) => [1])
// $ExpectError
numberStack = Stack([1]).flatMap((value, index, iter) => ['a'])

numberStack = Stack([1]).flatten()
numberStack = Stack(['a']).flatten()

/* Range & Repeat */

// `{}` provide namespaces
{ const numberSequence: IndexedSeq<number> = Range(0, 0, 0) }
{ const numberSequence: IndexedSeq<number> = Repeat(1, 5) }

{ const stringSequence: IndexedSeq<string> = Repeat('a', 5) }
// $ExpectError
{ const stringSequence: IndexedSeq<string> = Repeat(0, 1) }
// $ExpectError
{ const stringSequence: IndexedSeq<string> = Range(0, 0, 0) }

/* Seq */

let numberSeq = Seq([ 1, 2, 3 ])
// $ExpectError
let numberSeqSize: number = numberSeq.size
let maybeNumberSeqSize: ?number = numberSeq.size

/* Record */

type PersonRecordMembers = { age: number, name: string }
const PersonRecordClass = Record(({
  age: 12,
  name: 'Facebook',
}: PersonRecordMembers))
type PersonRecordInstance = RecordInstance<PersonRecordMembers> & PersonRecordMembers;

const personRecordInstance: PersonRecordInstance = PersonRecordClass({ age: 25 })

// $ExpectError
{ const age: string = personRecordInstance.get('age') }
// $ExpectError
{ const age: string = personRecordInstance.age }
{ const age: number = personRecordInstance.get('age') }
{ const age: number = personRecordInstance.age }

// $ExpectError
personRecordInstance.set('invalid', 25)
personRecordInstance.set('name', '25')
personRecordInstance.set('age', 33)
