import { Collection, List, Map, OrderedMap, OrderedSet, Seq, Set } from "immutable";

abstract class A {}
class B extends A {}

{
    type Indexed<T> = Collection.Indexed<T>;
    type Keyed<K, V> = Collection.Keyed<K, V>;
    type Set<T> = Collection.Set<T>;

    (c: Collection<string, number>) => {
        // $ExpectType [Collection<string, number>, Collection<string, number>]
        c.partition((x) => x % 2);
    };

    (c: Collection<string, A>) => {
        // $ExpectType [Collection<string, A>, Collection<string, B>]
        c.partition((x): x is B => x instanceof B);
    };

    (c: Keyed<string, number>) => {
        // $ExpectType [Keyed<string, number>, Keyed<string, number>]
        c.partition((x) => x % 2);
    };

    (c: Keyed<string, A>) => {
        // $ExpectType [Keyed<string, A>, Keyed<string, B>]
        c.partition((x): x is B => x instanceof B);
    };

    (c: Indexed<number>) => {
        // $ExpectType [Indexed<number>, Indexed<number>]
        c.partition((x) => x % 2);
    };

    (c: Indexed<A>) => {
        // $ExpectType [Indexed<A>, Indexed<B>]
        c.partition((x): x is B => x instanceof B);
    };

    (c: Set<number>) => {
        // $ExpectType [Set<number>, Set<number>]
        c.partition((x) => x % 2);
    };

    (c: Set<A>) => {
        // $ExpectType [Set<A>, Set<B>]
        c.partition((x): x is B => x instanceof B);
    };
}

{
    type Indexed<T> = Seq.Indexed<T>;
    type Keyed<K, V> = Seq.Keyed<K, V>;
    type Set<T> = Seq.Set<T>;

    (c: Seq<string, number>) => {
        // $ExpectType [Seq<string, number>, Seq<string, number>]
        c.partition((x) => x % 2);
    };

    (c: Seq<string, A>) => {
        // $ExpectType [Seq<string, A>, Seq<string, B>]
        c.partition((x): x is B => x instanceof B);
    };

    (c: Keyed<string, number>) => {
        // $ExpectType [Keyed<string, number>, Keyed<string, number>]
        c.partition((x) => x % 2);
    };

    (c: Keyed<string, A>) => {
        // $ExpectType [Keyed<string, A>, Keyed<string, B>]
        c.partition((x): x is B => x instanceof B);
    };

    (c: Indexed<number>) => {
        // $ExpectType [Indexed<number>, Indexed<number>]
        c.partition((x) => x % 2);
    };

    (c: Indexed<A>) => {
        // $ExpectType [Indexed<A>, Indexed<B>]
        c.partition((x): x is B => x instanceof B);
    };

    (c: Set<number>) => {
        // $ExpectType [Set<number>, Set<number>]
        c.partition((x) => x % 2);
    };

    (c: Set<A>) => {
        // $ExpectType [Set<A>, Set<B>]
        c.partition((x): x is B => x instanceof B);
    };
}

(c: Map<string, number>) => {
    // $ExpectType [Map<string, number>, Map<string, number>]
    c.partition((x) => x % 2);
};

(c: Map<string, A>) => {
    // $ExpectType [Map<string, A>, Map<string, B>]
    c.partition((x): x is B => x instanceof B);
};

(c: OrderedMap<string, number>) => {
    // $ExpectType [OrderedMap<string, number>, OrderedMap<string, number>]
    c.partition((x) => x % 2);
};

(c: OrderedMap<string, A>) => {
    // $ExpectType [OrderedMap<string, A>, OrderedMap<string, B>]
    c.partition((x): x is B => x instanceof B);
};

(c: List<number>) => {
    // $ExpectType [List<number>, List<number>]
    c.partition((x) => x % 2);
};

(c: List<A>) => {
    // $ExpectType [List<A>, List<B>]
    c.partition((x): x is B => x instanceof B);
};

(c: Set<number>) => {
    // $ExpectType [Set<number>, Set<number>]
    c.partition((x) => x % 2);
};

(c: Set<A>) => {
    // $ExpectType [Set<A>, Set<B>]
    c.partition((x): x is B => x instanceof B);
};

(c: OrderedSet<number>) => {
    // $ExpectType [OrderedSet<number>, OrderedSet<number>]
    c.partition((x) => x % 2);
};

(c: OrderedSet<A>) => {
    // $ExpectType [OrderedSet<A>, OrderedSet<B>]
    c.partition((x): x is B => x instanceof B);
};
