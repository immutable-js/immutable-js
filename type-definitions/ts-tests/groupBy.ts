import { List, Map, Record, Set, Seq, DeepCopy, Collection } from 'immutable';

{
    // $ExpectType Map<string, Collection<number, string>>
    List(['a', 'b', 'a']).groupBy(v => v);

    // $ExpectType Map<string, Collection<string, string>>
    Set(['a', 'b', 'a']).groupBy(v => v);

    // $ExpectType Map<string, Collection<string, string>>
    Map({a: 'A', b: 'B'}).groupBy(v => v);
}
