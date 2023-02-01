import { List, Map, OrderedMap, Record, Set, Seq, Stack, OrderedSet, DeepCopy, Collection } from 'immutable';

{
    // $ExpectType Map<string, Collection<number, string>>
    List(['a', 'b', 'a']).groupBy(v => v);

    // $ExpectType Map<string, Collection<string, string>>
    Set(['a', 'b', 'a']).groupBy(v => v);

    // $ExpectType Map<string, Collection<string, string>>
    Map({a: 'A', b: 'B'}).groupBy(v => v);

    // $ExpectType OrderedMap<string, Collection<number, string>>
    Collection(['a', 'b', 'c', 'a']).groupBy(v => v)

    // $ExpectType OrderedMap<string, List<string>>
    List(['a', 'b', 'c', 'a']).groupBy(v => v)

    // $ExpectType OrderedMap<string, Seq<string>>
    Seq(['a', 'b', 'c', 'a']).groupBy(v => v)

    // $ExpectType Map<string, Set<string>>
    Set(['a', 'b', 'c', 'a']).groupBy(v => v)

    // $ExpectType OrderedMap<string, Stack<string>>
    Stack(['a', 'b', 'c', 'a']).groupBy(v => v)

    // $ExpectType OrderedMap<string, OrderedSet<string>>
    OrderedSet(['a', 'b', 'c', 'a']).groupBy(v => v)

    // $ExpectType Map<string, Map<string, number>>
    Map({'a': 1, 'b': 2, 'c': 3, 'd' :1}).groupBy(v => $`key-${v}`);

    // $ExpectType OrderedMap<string, Map<string, number>>
    OrderedMap({'a': 1, 'b': 2, 'c': 3, 'd' :1}).groupBy(v => $`key-${v}`)
}
