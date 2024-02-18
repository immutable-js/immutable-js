import { expectType } from 'tsd';
import { List, Map, Record, Set, Seq, DeepCopy, Collection } from 'immutable';

// Basic types

type Test = DeepCopy<{ a: number; b: number }>;
declare let test: Test;
expectType<{ a: number; b: number }>(test);

// Iterables

type Test2 = DeepCopy<string[]>;
declare let test2: Test2;
expectType<string[]>(test2);

type Indexed = DeepCopy<Collection.Indexed<number>>;
declare let indexed: Indexed;
expectType<number[]>(indexed);

// Immutable first-level types

type StringKey = DeepCopy<Map<string, string>>;
declare let stringKey: StringKey;
expectType<{ [x: string]: string }>(stringKey);

// should be `{ [x: string]: object; }` but there is an issue with circular references
type ObjectKey = DeepCopy<Map<object, object>>;
declare let objectKey: ObjectKey;
expectType<{ [x: string]: unknown }>(objectKey);

// should be `{ [x: string]: object; [x: number]: object; }` but there is an issue with circular references
type MixedKey = DeepCopy<Map<object | number, object>>;
declare let mixedKey: MixedKey;
expectType<{ [x: string]: unknown; [x: number]: unknown }>(mixedKey);

type ListDeepCopy = DeepCopy<List<string>>;
declare let listDeepCopy: ListDeepCopy;
expectType<string[]>(listDeepCopy);

type SetDeepCopy = DeepCopy<Set<string>>;
declare let setDeepCopy: SetDeepCopy;
expectType<string[]>(setDeepCopy);

// Keyed

type Keyed = DeepCopy<Collection.Keyed<string, number>>;
declare let keyed: Keyed;
expectType<{ [x: string]: number }>(keyed);

type KeyedMixed = DeepCopy<Collection.Keyed<string | number, number>>;
declare let keyedMixed: KeyedMixed;
expectType<{ [x: string]: number; [x: number]: number }>(keyedMixed);

type KeyedSeqMixed = DeepCopy<Seq.Keyed<string | number, number>>;
declare let keyedSeqMixed: KeyedSeqMixed;
expectType<{ [x: string]: number; [x: number]: number }>(keyedSeqMixed);

type MapMixed = DeepCopy<Map<string | number, number>>;
declare let mapMixed: MapMixed;
expectType<{ [x: string]: number; [x: number]: number }>(mapMixed);

// Nested

// should be `{ map: { [x: string]: string; }; list: string[]; set: string[]; }` but there is an issue with circular references
type NestedObject = DeepCopy<{
  map: Map<string, string>;
  list: List<string>;
  set: Set<string>;
}>;
declare let nestedObject: NestedObject;
expectType<{ map: unknown; list: unknown; set: unknown }>(nestedObject);

// should be `{ map: { [x: string]: string; }; }`, but there is an issue with circular references
type NestedMap = DeepCopy<Map<'map', Map<string, string>>>;
declare let nestedMap: NestedMap;
expectType<{ map: unknown }>(nestedMap);

// Circular references

type Article = Record<{ title: string; tag: Tag }>;
type Tag = Record<{ name: string; article: Article }>;

// should handle circular references here somehow
type Circular = DeepCopy<Article>;
declare let circular: Circular;
expectType<{ title: string; tag: unknown }>(circular);

// Circular references #1957

class Foo1 extends Record<{
  foo: undefined | Foo1;
}>({
  foo: undefined,
}) {}

class Foo2 extends Record<{
  foo?: Foo2;
}>({
  foo: undefined,
}) {}

class Foo3 extends Record<{
  foo: null | Foo3;
}>({
  foo: null,
}) {}

type DeepFoo1 = DeepCopy<Foo1>;
declare let deepFoo1: DeepFoo1;
expectType<{ foo: unknown }>(deepFoo1);

type DeepFoo2 = DeepCopy<Foo2>;
declare let deepFoo2: DeepFoo2;
expectType<{ foo?: unknown }>(deepFoo2);

type DeepFoo3 = DeepCopy<Foo3>;
declare let deepFoo3: DeepFoo3;
expectType<{ foo: unknown }>(deepFoo3);

class FooWithList extends Record<{
  foos: undefined | List<FooWithList>;
}>({
  foos: undefined,
}) {}

type DeepFooList = DeepCopy<FooWithList>;
declare let deepFooList: DeepFooList;
expectType<{ foos: unknown }>(deepFooList);
