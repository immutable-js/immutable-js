import { List, Map, OrderedMap, Record, Set, Seq, Stack, OrderedSet, DeepCopy, Collection } from 'immutable';

{
    // $ExpectType Map<string, Indexed<string>>
    Collection(['a', 'b', 'c', 'a']).groupBy(v => v);

    // $ExpectType Map<string, List<string>>
    List(['a', 'b', 'c', 'a']).groupBy(v => v);

    // $ExpectType Map<string, Indexed<string>>
    Seq(['a', 'b', 'c', 'a']).groupBy(v => v);

    // $ExpectType Map<string, Set<string>>
    Set(['a', 'b', 'c', 'a']).groupBy(v => v);

    // $ExpectType Map<string, Stack<string>>
    Stack(['a', 'b', 'c', 'a']).groupBy(v => v);

    // $ExpectType Map<string, OrderedSet<string>>
    OrderedSet(['a', 'b', 'c', 'a']).groupBy(v => v);

    // $ExpectType Map<string, Map<string, number>>
    Map({ a: 1, b: 2, c: 3, d: 1 }).groupBy(v => `key-${v}`);

    // $ExpectType Map<string, OrderedMap<string, number>>
    OrderedMap({ a: 1, b: 2, c: 3, d: 1 }).groupBy(v => `key-${v}`);
}
