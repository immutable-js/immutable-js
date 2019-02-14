/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Some tests look like they are repeated in order to avoid false positives.

import * as Immutable from '../../';
import {
    List,
    Map,
    OrderedMap,
    OrderedSet,
    Range,
    Stretch,
    Repeat,
    Times,
    IterateUntil,
    Seq,
    Set,
    Stack,
    Collection
} from '../../';

List; // $ExpectType typeof List
Map; // $ExpectType typeof Map
OrderedMap; // $ExpectType typeof OrderedMap
OrderedSet; // $ExpectType typeof OrderedSet
// TODO: Turn on once https://github.com/Microsoft/dtslint/issues/19 is resolved.
Range; // $ ExpectType (start?: number | undefined, end?: number | undefined, step?: number | undefined) => Indexed<number>
Stretch; // $ ExpectType (base: number, ends?: number | undefined, front?: number | undefined) => Indexed<number>
Repeat; // $ExpectType <T>(value: T, times?: number | undefined) => Indexed<T>
Times; // $ExpectType <T>(times: number, func: Function, seed?: any) => Indexed<any>
IterateUntil; // $ExpectType <T>(func: Function, condition: Function, seed?: any) => Indexed<any>
Seq; // $ExpectType typeof Seq
Set; // $ExpectType typeof Set
Stack; // $ExpectType typeof Stack
Collection; // $ExpectType typeof Collection
Collection.Set; // $ExpectType <T>(collection: Iterable<T>) => Set<T>
Collection.Keyed; // $ ExpectType { <K, V>(collection: Iterable<[K, V]>): Keyed<K, V>; <V>(obj: { [key: string]: V; }): Keyed<string, V> }
Collection.Indexed; // $ExpectType <T>(collection: Iterable<T>) => Indexed<T>

Immutable.List; // $ExpectType typeof List
Immutable.Map; // $ExpectType typeof Map
Immutable.OrderedMap; // $ExpectType typeof OrderedMap
Immutable.OrderedSet; // $ExpectType typeof OrderedSet
// TODO: Turn on once https://github.com/Microsoft/dtslint/issues/19 is resolved.
Immutable.Range; // $ ExpectType (start?: number | undefined, end?: number | undefined, step?: number | undefined) => Indexed<number>
Immutable.Stretch; // $ ExpectType (base: number, ends?: number | undefined, front?: number | undefined) => Indexed<number>
Immutable.Repeat; // $ExpectType <T>(value: T, times?: number | undefined) => Indexed<T>
Immutable.Times; // $ExpectType <T>(times: number, func: Function, seed?: any) => Indexed<any>
Immutable.IterateUntil; // $ExpectType <T>(func: Function, condition: Function, seed?: any) => Indexed<any>
/*i used any because seed could be anything and we might have a case where we return the
Seq.Indexed has a different type than seed*/
Immutable.Seq; // $ExpectType typeof Seq
Immutable.Set; // $ExpectType typeof Set
Immutable.Stack; // $ExpectType typeof Stack
Immutable.Collection; // $ExpectType typeof Collection
Immutable.Collection.Set; // $ExpectType <T>(collection: Iterable<T>) => Set<T>
Immutable.Collection.Keyed; // $ ExpectType { <K, V>(collection: Iterable<[K, V]>): Keyed<K, V>; <V>(obj: { [key: string]: V; }): Keyed<string, V> }
Immutable.Collection.Indexed; // $ExpectType <T>(collection: Iterable<T>) => Indexed<T>
