// TypeScript Version: 2.2.1

// let stringToNumberCollection: Collection.Keyed<string, number> = stringToNumber;
// let numberToStringCollection: Collection.Keyed<number, string> = numberToString;

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
