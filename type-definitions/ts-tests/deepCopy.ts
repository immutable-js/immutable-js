import { List, Map, Record, Set, Seq, DeepCopy, Collection } from 'immutable';

{
  // Basic types

  // $ExpectType { a: number; b: number; }
  type Test = DeepCopy<{ a: number; b: number }>;
}

{
  // Iterables

  // $ExpectType string[]
  type Test = DeepCopy<string[]>;

  // $ExpectType number[]
  type Keyed = DeepCopy<Collection.Indexed<number>>;
}

{
  // Immutable first-level types

  // $ExpectType { [x: string]: string; }
  type StringKey = DeepCopy<Map<string, string>>;

  // should be `{ [x: string]: object; }` but there is an issue with circular references
  // $ExpectType { [x: string]: unknown; }
  type ObjectKey = DeepCopy<Map<object, object>>;

  // should be `{ [x: string]: object; [x: number]: object; }` but there is an issue with circular references
  // $ExpectType { [x: string]: unknown; [x: number]: unknown; }
  type MixedKey = DeepCopy<Map<object | number, object>>;

  // $ExpectType string[]
  type ListDeepCopy = DeepCopy<List<string>>;

  // $ExpectType string[]
  type SetDeepCopy = DeepCopy<Set<string>>;
}

{
  // Keyed

  // $ExpectType { [x: string]: number; }
  type Keyed = DeepCopy<Collection.Keyed<string, number>>;

  // $ExpectType { [x: string]: number; [x: number]: number; }
  type KeyedMixed = DeepCopy<Collection.Keyed<string | number, number>>;

  // $ExpectType { [x: string]: number; [x: number]: number; }
  type KeyedSeqMixed = DeepCopy<Seq.Keyed<string | number, number>>;

  // $ExpectType { [x: string]: number; [x: number]: number; }
  type MapMixed = DeepCopy<Map<string | number, number>>;
}

{
  // Nested

  // should be `{ map: { [x: string]: string; }; list: string[]; set: string[]; }` but there is an issue with circular references
  // $ExpectType { map: unknown; list: unknown; set: unknown; }
  type NestedObject = DeepCopy<{
    map: Map<string, string>;
    list: List<string>;
    set: Set<string>;
  }>;

  // should be `{ map: { [x: string]: string; }; }`, but there is an issue with circular references
  // $ExpectType { map: unknown; }
  type NestedMap = DeepCopy<Map<'map', Map<string, string>>>;
}

{
  // Circular references

  type Article = Record<{ title: string; tag: Tag }>;
  type Tag = Record<{ name: string; article: Article }>;

  // should handle circular references here somehow
  // $ExpectType { title: string; tag: unknown; }
  type Circular = DeepCopy<Article>;
}

{
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

  // $ExpectType { foo: unknown; }
  type DeepFoo1 = DeepCopy<Foo1>;

  // $ExpectType { foo?: unknown; }
  type DeepFoo2 = DeepCopy<Foo2>;

  // $ExpectType { foo: unknown; }
  type DeepFoo3 = DeepCopy<Foo3>;

  class FooWithList extends Record<{
    foos: undefined | List<FooWithList>;
  }>({
    foos: undefined,
  }) {}

  // $ExpectType { foos: unknown; }
  type DeepFooList = DeepCopy<FooWithList>;
}
