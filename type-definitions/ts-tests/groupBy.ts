import { expectType } from 'tsd';
import {
  List,
  Map,
  MapOf,
  OrderedMap,
  Record,
  Set,
  Seq,
  Stack,
  OrderedSet,
  DeepCopy,
  Collection,
} from 'immutable';

{
  expectType<Map<string, Collection.Indexed<string>>>(
    Collection(['a', 'b', 'c', 'a']).groupBy(v => v)
  );

  expectType<Map<string, Collection.Keyed<string, number>>>(
    Collection({ a: 1, b: 2, c: 3, d: 1 }).groupBy(v => `key-${v}`)
  );

  expectType<Map<string, List<string>>>(
    List(['a', 'b', 'c', 'a']).groupBy(v => v)
  );

  expectType<Map<string, Seq.Indexed<string>>>(
    Seq(['a', 'b', 'c', 'a']).groupBy(v => v)
  );

  expectType<Map<string, Seq.Keyed<string, number>>>(
    Seq({ a: 1, b: 2, c: 3, d: 1 }).groupBy(v => `key-${v}`)
  );

  expectType<Map<string, Set<string>>>(
    Set(['a', 'b', 'c', 'a']).groupBy(v => v)
  );

  expectType<Map<string, Stack<string>>>(
    Stack(['a', 'b', 'c', 'a']).groupBy(v => v)
  );

  expectType<Map<string, OrderedSet<string>>>(
    OrderedSet(['a', 'b', 'c', 'a']).groupBy(v => v)
  );

  expectType<Map<string, Map<string, number>>>(
    Map<string, number>({ a: 1, b: 2, c: 3, d: 1 }).groupBy(v => `key-${v}`)
  );

  // type should be something like  Map<string, MapOf<Partial{ a: number, b: number, c: number, d: number }>>> but groupBy returns a wrong type with `this`
  expectType<
    Map<string, MapOf<{ a: number; b: number; c: number; d: number }>>
  >(Map({ a: 1, b: 2, c: 3, d: 1 }).groupBy(v => `key-${v}`));

  expectType<Map<string, OrderedMap<string, number>>>(
    OrderedMap({ a: 1, b: 2, c: 3, d: 1 }).groupBy(v => `key-${v}`)
  );
}
