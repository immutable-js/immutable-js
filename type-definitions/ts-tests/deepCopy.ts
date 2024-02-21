import { describe, expect, test } from 'tstyche';
import { List, Map, Record, Set, Seq, DeepCopy, Collection } from 'immutable';

describe('DeepCopy', () => {
  test('basic types', () => {
    expect<
      DeepCopy<{
        a: number;
        b: number;
      }>
    >().type.toEqual<{
      a: number;
      b: number;
    }>();
  });

  test('iterables', () => {
    expect<DeepCopy<string[]>>().type.toEqual<string[]>();

    expect<DeepCopy<Collection.Indexed<number>>>().type.toEqual<number[]>();
  });

  test('immutable first-level types', () => {
    expect<DeepCopy<Map<string, string>>>().type.toEqual<{
      [x: string]: string;
    }>();

    // should be `{ [x: string]: object }`, but there is an issue with circular references
    expect<DeepCopy<Map<object, object>>>().type.toEqual<{
      [x: string]: unknown;
    }>();

    // should be `{ [x: string]: object; [x: number]: object }`, but there is an issue with circular references
    expect<DeepCopy<Map<object | number, object>>>().type.toEqual<{
      [x: string]: unknown;
      [x: number]: unknown;
    }>();

    expect<DeepCopy<List<string>>>().type.toEqual<string[]>();

    expect<DeepCopy<Set<string>>>().type.toEqual<string[]>();
  });

  test('keyed', () => {
    expect<DeepCopy<Collection.Keyed<string, number>>>().type.toEqual<{
      [x: string]: number;
    }>();

    expect<DeepCopy<Collection.Keyed<string | number, number>>>().type.toEqual<{
      [x: string]: number;
      [x: number]: number;
    }>();

    expect<DeepCopy<Seq.Keyed<string | number, number>>>().type.toEqual<{
      [x: string]: number;
      [x: number]: number;
    }>();

    expect<DeepCopy<Map<string | number, number>>>().type.toEqual<{
      [x: string]: number;
      [x: number]: number;
    }>();
  });

  test('nested', () => {
    // should be `{ map: { [x: string]: string }; list: string[]; set: string[] }`, but there is an issue with circular references
    expect<
      DeepCopy<{
        map: Map<string, string>;
        list: List<string>;
        set: Set<string>;
      }>
    >().type.toEqual<{ map: unknown; list: unknown; set: unknown }>();

    // should be `{ map: { [x: string]: string } }`, but there is an issue with circular references
    expect<DeepCopy<Map<'map', Map<string, string>>>>().type.toEqual<{
      map: unknown;
    }>();
  });

  test('circular references', () => {
    type Article = Record<{ title: string; tag: Tag }>;
    type Tag = Record<{ name: string; article: Article }>;

    // should handle circular references here somehow
    expect<DeepCopy<Article>>().type.toEqual<{ title: string; tag: unknown }>();
  });

  test('circular references #1957', () => {
    class Foo1 extends Record<{ foo: undefined | Foo1 }>({
      foo: undefined,
    }) {}

    class Foo2 extends Record<{ foo?: Foo2 }>({
      foo: undefined,
    }) {}

    class Foo3 extends Record<{ foo: null | Foo3 }>({
      foo: null,
    }) {}

    expect<DeepCopy<Foo1>>().type.toEqual<{ foo: unknown }>();
    expect<DeepCopy<Foo2>>().type.toEqual<{ foo?: unknown }>();
    expect<DeepCopy<Foo3>>().type.toEqual<{ foo: unknown }>();

    class FooWithList extends Record<{ foo: undefined | List<FooWithList> }>({
      foo: undefined,
    }) {}

    expect<DeepCopy<FooWithList>>().type.toEqual<{ foo: unknown }>();
  });
});
