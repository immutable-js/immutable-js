// TypeScript Version: 2.2.1
// Some tests look like they are repeated in order to avoid false positives.

// let numberSet: Set<number> = Set();
// let stringSet: Set<string> = Set();
// let numberOrStringSet: Set<number | string> = Set();
// let orderedStringSet: OrderedSet<string> = OrderedSet();
// let orderedNumberSet: OrderedSet<number> = OrderedSet();
// let orderedNumberOrStringSet: OrderedSet<string | number> = OrderedSet();
//
// let numberStack: Stack<number> = Stack();
// let numberOrStringStack: Stack<string | number> = Stack();
//
// let stringToNumberCollection: Collection.Keyed<string, number> = stringToNumber;
// let numberToStringCollection: Collection.Keyed<number, string> = numberToString;

// /* Set */
//
// numberSet = Set();
// numberOrStringSet = Set();
// stringSet = Set();
//
// numberSet = Set([1, 2, 3]);
// // $ExpectError
// numberSet = Set(['a', 'b']);
//
// numberSet = Set.of(1, 2);
// // $ExpectError
// numberSet = Set.of('a', 'b');
//
// numberSet = Set.fromKeys(Map().set(1, ''));
// stringSet = Set.fromKeys({a: ''});
// // $ExpectError
// numberSet = Set.fromKeys(Map({a: 1}));
// // $ExpectError
// numberSet = Set.fromKeys({a: 1});
//
// numberOrStringSet = Set([1]).add('a');
// // $ExpectError
// numberSet = Set([1]).add('s');
//
// numberSet = Set([1]).delete(1);
// // $ExpectError
// numberSet = Set([1]).delete('a');
// // $ExpectError
// numberSet = Set(['a']).delete('a');
//
// numberSet = Set([1]).remove(1);
// // $ExpectError
// numberSet = Set([1]).remove('a');
// // $ExpectError
// numberSet = Set(['a']).remove('a');
//
// numberSet = Set([1]).clear();
// // $ExpectError
// numberSet = Set(['a']).clear();
//
// numberOrStringSet = Set(['a']).union([1]);
// numberOrStringSet = Set(['a']).union(Set([1]));
// numberSet = Set([1]).union([1]);
// numberSet = Set([1]).union(Set([1]));
// // $ExpectError
// numberSet = Set([1]).union(['a']);
// // $ExpectError
// numberSet = Set([1]).union(Set(['a']));
//
// numberOrStringSet = Set(['a']).merge([1]);
// numberOrStringSet = Set(['a']).merge(Set([1]));
// numberSet = Set([1]).merge([1]);
// numberSet = Set([1]).merge(Set([1]));
// // $ExpectError
// numberSet = Set([1]).merge(['a']);
// // $ExpectError
// numberSet = Set([1]).merge(Set(['a']));
//
// numberSet = Set([1]).intersect(Set([1]));
// numberSet = Set([1]).intersect([1]);
// numberSet = Set([1]).intersect(Set(['a']));
// numberSet = Set([1]).intersect(['a']);
//
// numberSet = Set([1]).subtract(Set([1]));
// numberSet = Set([1]).subtract([1]);
// numberSet = Set([1]).subtract(Set(['a']));
// numberSet = Set([1]).subtract(['a']);
//
// numberSet = Set([1]).withMutations(mutable => mutable);
// // $ExpectError
// stringSet = Set([1]).withMutations(mutable => mutable);
//
// numberSet = Set([1]).asMutable();
// // $ExpectError
// stringSet = Set([1]).asMutable();
//
// numberSet = Set([1]).asImmutable();
// // $ExpectError
// stringSet = Set([1]).asImmutable();
//
// stringSet = Set([1]).map((value, index, iter) => 'a');
// // $ExpectError
// numberSet = Set([1]).map((value, index, iter) => 'a');
//
// stringSet = Set([1]).flatMap((value, index, iter) => ['a']);
// // $ExpectError
// numberSet = Set([1]).flatMap((value, index, iter) => ['a']);
//
// numberSet = Set([1]).flatten();
//
// /* OrderedSet */
//
// orderedStringSet = Set(['a']).toOrderedSet();
// // $ExpectError - this is actually an OrderedSet<number>
// orderedStringSet = Set([1]).toOrderedSet();
// orderedNumberSet = Set([1]).toOrderedSet();
//
// orderedStringSet = OrderedSet(['a']);
// // $ExpectError - this is actually an OrderedSet<number>
// orderedStringSet = OrderedSet([1]);
// orderedNumberSet = OrderedSet([1]);
//
// orderedStringSet = OrderedSet(List.of('a'));
// // $ExpectError - this is actually an OrderedSet<number>
// orderedStringSet = OrderedSet(List.of(1));
// orderedNumberSet = OrderedSet(List.of(1));
//
// orderedStringSet = OrderedSet.of('a', 'b', 'c');
// // $ExpectError - this is actually an OrderedSet<number>
// orderedStringSet = OrderedSet.of(1);
// orderedNumberSet = OrderedSet.of(1);
//
// orderedStringSet = OrderedSet.fromKeys(Map({a: 1}));
// // $ExpectError - this is actually an OrderedSet<string>
// orderedNumberSet = OrderedSet.fromKeys(Map({a: 1}));
//
// orderedStringSet = OrderedSet.fromKeys({a: 1});
// // $ExpectError - this is actually an OrderedSet<string>
// orderedNumberSet = OrderedSet.fromKeys({a: 1});
//
// orderedStringSet = OrderedSet();
//
// orderedStringSet = OrderedSet.of('a').add('b');
// /**
//  * TODO: in typescript definitions, add looks like
//  *
//  * ```
//  * add(value: T): Set<T>
//  * ```
//  *
//  * so we shouldn't be able to add a number to a set of strings
//  */
// // $ExpectError - this is actually an OrderedSet<number|string>
// orderedStringSet = OrderedSet('a').add(1);
// orderedNumberOrStringSet = OrderedSet('a').add(1);
//
// orderedStringSet = OrderedSet.of('a').delete('a');
// // $ExpectError - 1 is an invalid arg
// orderedStringSet = OrderedSet.of('a').delete(1);
//
// orderedStringSet = OrderedSet.of('a').remove('a');
// // $ExpectError - 1 is an invalid arg
// orderedStringSet = OrderedSet.of('a').remove(1);
//
// orderedStringSet = OrderedSet.of('a').clear();
//
// orderedStringSet = OrderedSet.of('a').union(OrderedSet.of('b'));
// /**
//  * TODO: typescript def looks like
//  *
//  * ```
//  * union(...iterables: Array<T>[]): Set<T>
//  * ```
//  *
//  * so we shouldn't be able to merge strings and numbers
//  */
// // $ExpectError - this is actually an OrderedSet<number|string>
// orderedStringSet = OrderedSet.of('a').union(OrderedSet.of(1));
// orderedNumberOrStringSet = OrderedSet.of('a').union(OrderedSet.of(1));
//
// orderedStringSet = OrderedSet.of('a').merge(OrderedSet.of('b'));
// /**
//  * TODO: typescript def looks like
//  *
//  * ```
//  * merge(...iterables: Array<T>[]): Set<T>
//  * ```
//  *
//  * so we shouldn't be able to merge strings and numbers
//  */
// // $ExpectError - this is actually an OrderedSet<number|string>
// orderedStringSet = OrderedSet.of('a').merge(OrderedSet.of(1));
// orderedNumberOrStringSet = OrderedSet.of('a').merge(OrderedSet.of(1));
//
// orderedStringSet = OrderedSet.of('a', 'b').intersect(OrderedSet.of('a'));
// /**
//  * TODO: typescript def looks like
//  *
//  * ```
//  * intersect(...iterables: Array<T>[]): Set<T>
//  * ```
//  *
//  * so we shouldn't be able to intersect strings and numbers
//  */
// orderedStringSet = OrderedSet.of('a', 'b').intersect(OrderedSet.of(1));
//
// orderedStringSet = OrderedSet.of('a', 'b').subtract(OrderedSet.of('a'));
// /**
//  * TODO: typescript def looks like
//  *
//  * ```
//  * subtract(...iterables: Array<T>[]): Set<T>
//  * ```
//  *
//  * so we shouldn't be able to intersect strings and numbers
//  */
// orderedStringSet = OrderedSet.of('a', 'b').subtract(OrderedSet.of(1));
//
// orderedStringSet = OrderedSet().withMutations(mutable => mutable.add('a'));
// orderedStringSet = OrderedSet.of('a').asMutable();
// orderedStringSet = OrderedSet.of('a').asImmutable();
//
// orderedStringSet = OrderedSet.of('a', 'b').map(m => m);
// // $ExpectError - this is an OrderedSet<number>
// orderedStringSet = OrderedSet.of('a', 'b').map(() => 1);
// orderedNumberSet = OrderedSet.of('a', 'b').map(() => 1);
//
// orderedStringSet = OrderedSet.of('a', 'b').flatMap(m => [m]);
// // $ExpectError - this is an OrderedSet<number>
// orderedStringSet = OrderedSet.of('a', 'b').flatMap(m => [1]);
// orderedNumberSet = OrderedSet.of('a', 'b').flatMap(m => [1]);
//
// orderedStringSet = OrderedSet.of('a', 'b').flatten(1);
// orderedStringSet = OrderedSet.of('a', 'b').flatten(false);
// // $ExpectError - invalid arg for flatten
// orderedStringSet = OrderedSet.of('a', 'b').flatten('a');
//
// /* Stack */
//
// numberStack = Stack([1, 2]);
// let numberStackSize: number = numberStack.size;
// numberOrStringStack = Stack(['a', 1]);
// // $ExpectError
// numberStack = Stack(['a', 'b']);
//
// numberStack = Stack.of(1, 2);
// numberOrStringStack = Stack.of('a', 1);
// // $ExpectError
// numberStack = Stack.of('a', 1);
//
// num = Stack([1]).peek();
// // $ExpectError
// num = Stack(['a']).peek();
//
// numberStack = Stack([1]).unshift(1);
// numberOrStringStack = Stack([1]).unshift('a');
// // $ExpectError
// numberStack = Stack([1]).unshift('a');
//
// numberStack = Stack([1]).unshiftAll([1]);
// numberOrStringStack = Stack([1]).unshiftAll(['a']);
// // $ExpectError
// numberStack = Stack([1]).unshiftAll(['a']);
//
// numberStack = Stack.of(1).shift();
// // $ExpectError
// numberStack = Stack.of('a').shift();
//
// numberStack = Stack().push(1);
// numberOrStringStack = Stack([1]).push('a');
// // $ExpectError
// numberStack = Stack().push('a');
//
// numberStack = Stack().pushAll([1]);
// numberOrStringStack = Stack([1]).pushAll(['a']);
// // $ExpectError
// numberStack = Stack().push(['a']);
//
// numberStack = Stack.of(1).pop();
// // $ExpectError
// numberStack = Stack.of('a').pop();
//
// numberStack = Stack([1]).withMutations(mutable => mutable);
// // $ExpectError
// numberStack = Stack(['a']).withMutations(mutable => mutable);
//
// numberStack = Stack([1]).asMutable();
// // $ExpectError
// numberStack = Stack(['a']).asMutable();
//
// numberStack = Stack([1]).asImmutable();
// // $ExpectError
// numberStack = Stack(['a']).asImmutable();
//
// numberStack = Stack([1]).map((value, index, iter) => 1);
// // $ExpectError
// numberStack = Stack([1]).map((value, index, iter) => 'a');
//
// numberStack = Stack([1]).flatMap((value, index, iter) => [1]);
// // $ExpectError
// numberStack = Stack([1]).flatMap((value, index, iter) => ['a']);
//
// numberStack = Stack([1]).flatten();
// numberStack = Stack(['a']).flatten();
//
// /* Range & Repeat */
//
// // `{}` provide namespaces
// {
//     let numberSequence: IndexedSeq<number> = Range(0, 0, 0);
// }
// {
//     let numberSequence: IndexedSeq<number> = Repeat(1, 5);
// }
//
// {
//     let stringSequence: IndexedSeq<string> = Repeat('a', 5);
// }
// // $ExpectError
// {
//     let stringSequence: IndexedSeq<string> = Repeat(0, 1);
// }
// // $ExpectError
// {
//     let stringSequence: IndexedSeq<string> = Range(0, 0, 0);
// }
//
// /* Seq */
//
// let numberSeq = Seq([1, 2, 3]);
// // $ExpectError
// let numberSeqSize: number = numberSeq.size;
// let maybeNumberSeqSize: number | undefined = numberSeq.size;
