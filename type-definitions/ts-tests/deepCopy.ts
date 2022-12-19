import { List, Map, Record, Set, DeepCopy, Collection } from 'immutable';

{
  // Basic types

  // $ExpectType { a: number; b: number; }
  type Test = DeepCopy<{ a: number; b: number }>;
  //   ^?

  // $ExpectType number
  type TestA = Test['a'];
  //   ^?
}

{
  // Iterables

  // $ExpectType string[]
  type Test = DeepCopy<string[]>;
  //   ^?
}

{
  // Immutable first-level types

  // $ExpectType Record<string, string>
  type StringKey = DeepCopy<Map<string, string>>;
  //   ^?

  // $ExpectType Record<string, object>
  type ObjectKey = DeepCopy<Map<object, object>>;
  //   ^?

  // $ExpectType Record<string | number, object>
  type MixedKey = DeepCopy<Map<object | number, object>>;
  //   ^?

  // $ExpectType string[]
  type ListDeepCopy = DeepCopy<List<string>>;
  //   ^?

  // $ExpectType string[]
  type SetDeepCopy = DeepCopy<Set<string>>;
  //   ^?
}

{
  // Nested

  // $ExpectType { map: Record<string, string>; list: string[]; set: string[]; }
  type NestedObject = DeepCopy<{ map: Map<string, string>; list: List<string>; set: Set<string>; }>;
  //   ^?

  // $ExpectType Record<"map", Record<string, string>>
  type NestedMap = DeepCopy<Map<'map', Map<string, string>>>;
  //   ^?
}
