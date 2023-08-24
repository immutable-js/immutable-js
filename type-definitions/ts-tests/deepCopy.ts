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

  // $ExpectType { [x: string]: object; }
  type ObjectKey = DeepCopy<Map<object, object>>;

  // $ExpectType { [x: string]: object; [x: number]: object; }
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

  // $ExpectType { map: { [x: string]: string; }; list: string[]; set: string[]; }
  type NestedObject = DeepCopy<{ map: Map<string, string>; list: List<string>; set: Set<string>; }>;

  // $ExpectType { map: { [x: string]: string; }; }
  type NestedMap = DeepCopy<Map<'map', Map<string, string>>>;
}

{
  // Circular references

  type Article = Record<{ title: string; tag: Tag; }>;
  type Tag = Record<{ name: string; article: Article; }>;

  // $ExpectType { title: string; tag: { name: string; article: any; }; }
  type Circular = DeepCopy<Article>;
}
