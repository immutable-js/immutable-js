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
  KeyedIterable,
  Range,
  Repeat,
  IndexedSeq
} from 'immutable'
import * as Immutable2 from 'immutable'

const ImmutableList = Immutable.List
const ImmutableMap = Immutable.Map
const ImmutableStack = Immutable.Stack
const ImmutableSet = Immutable.Set
const ImmutableKeyedIterable = Immutable.KeyedIterable
const ImmutableRange = Immutable.Range
const ImmutableRepeat = Immutable.Repeat
const ImmutableIndexedSeq = Immutable.IndexedSeq

const Immutable2List = Immutable2.List
const Immutable2Map = Immutable2.Map
const Immutable2Stack = Immutable2.Stack
const Immutable2Set = Immutable2.Set
const Immutable2KeyedIterable = Immutable2.KeyedIterable
const Immutable2Range = Immutable2.Range
const Immutable2Repeat = Immutable2.Repeat
const Immutable2IndexedSeq = Immutable2.IndexedSeq

var numberList: List<number> = List()
var numberOrStringList: List<string | number> = List()
var nullableNumberList: List<?number> = List()
var stringToNumber: Map<string, number> = Map()
var stringToNumberOrString: Map<string, string | number> = Map()
var numberToString: Map<number, string> = Map()
var stringOrNumberToNumberOrString: Map<string | number, string | number> = Map()
var anyMap: Map<any, any> = Map()
var numberSet: Set<number> = Set()
var numberOrStringSet: Set<number | string> = Set()
var stringSet: Set<string> = Set()
var numberStack: Stack<number> = Stack()
var numberOrStringStack: Stack<string | number> = Stack()
var number: number = 0
var stringToNumberIterable: KeyedIterable<string, number> = stringToNumber
var numberToStringIterable: KeyedIterable<number, string> = numberToString

numberList = List([1, 2])
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
stringToNumberOrString = Map()
numberToString = Map()

stringToNumber = Map({'a': 1})
// $ExpectError
stringToNumber = Map({'a': 'a'})

stringToNumber = Map([['a', 1]])
// $ExpectError
stringToNumber = Map([['a', 'b']])

stringOrNumberToNumberOrString = Map({'a': 'a'}).set('b', 1).set(2, 'c')
// $ExpectError
stringToNumber = Map({'a': 0}).set('b', '')
// $ExpectError
stringToNumber = Map().set(1, '')

stringToNumber = Map({'a': 0}).delete('a')
stringToNumber = Map({'a': 0}).remove('a')

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

stringToNumber = Map({'a': 1}).mergeWith((previous, next, key) => 1, [1])
// $ExpectError
stringToNumber = Map({'a': 1}).mergeWith((previous, next, key) => previous + next, ['a'])

stringToNumberOrString = Map({'a': 1}).mergeDeep({'a': 'b'})
// $ExpectError
stringToNumber = Map({'a': 1}).mergeDeep({'a': 'b'})

stringToNumber = Map({'a': 1}).mergeDeepWith((previous, next, key) => 1, [1])
// $ExpectError
stringToNumber = Map({'a': 1}).mergeDeepWith((previous, next, key) => previous + next, ['a'])

stringToNumber = Map({'a': 1}).setIn([], 0)

stringToNumber = Map({'a': 1}).deleteIn([], 0)
stringToNumber = Map({'a': 1}).removeIn([], 0)

stringToNumber = Map({'a': 1}).mergeIn([], [])
stringToNumber = Map({'a': 1}).mergeDeepIn([], [])

anyMap = Map({'a': {}}).mergeIn(['a'], { b: 2 })
anyMap = Map({'a': {}}).mergeDeepIn(['a'], { b: 2 })
// $ExpectError
anyMap = Map({'a': {}}).mergeIn(['a'], 1)
// $ExpectError
anyMap = Map({'a': {}}).mergeDeepIn(['a'], 1)

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
// $ExpectError
numberSet = Set([1]).intersect(Set(['a']))
// $ExpectError
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

/* Stack */

numberStack = Stack([1, 2])
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


/* Record */
// TODO
