// TypeScript Version: 2.2.1

// let numberStack: Stack<number> = Stack();
// let numberOrStringStack: Stack<string | number> = Stack();
//
// let stringToNumberCollection: Collection.Keyed<string, number> = stringToNumber;
// let numberToStringCollection: Collection.Keyed<number, string> = numberToString;

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
