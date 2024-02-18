import { expectType } from 'tsd';
import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Seq,
  Set,
} from 'immutable';

abstract class A {}
class B extends A {}

{
  type Indexed<T> = Collection.Indexed<T>;
  type Keyed<K, V> = Collection.Keyed<K, V>;
  type Set<T> = Collection.Set<T>;

  (c: Collection<string, number>) => {
    expectType<[Collection<string, number>, Collection<string, number>]>(
      c.partition(x => x % 2)
    );
  };

  (c: Collection<string, A>) => {
    expectType<[Collection<string, A>, Collection<string, B>]>(
      c.partition((x): x is B => x instanceof B)
    );
  };

  (c: Keyed<string, number>) => {
    expectType<[Keyed<string, number>, Keyed<string, number>]>(
      c.partition(x => x % 2)
    );
  };

  (c: Keyed<string, A>) => {
    expectType<[Keyed<string, A>, Keyed<string, B>]>(
      c.partition((x): x is B => x instanceof B)
    );
  };

  (c: Indexed<number>) => {
    expectType<[Indexed<number>, Indexed<number>]>(c.partition(x => x % 2));
  };

  (c: Indexed<A>) => {
    expectType<[Indexed<A>, Indexed<B>]>(
      c.partition((x): x is B => x instanceof B)
    );
  };

  (c: Set<number>) => {
    expectType<[Set<number>, Set<number>]>(c.partition(x => x % 2));
  };

  (c: Set<A>) => {
    expectType<[Set<A>, Set<B>]>(c.partition((x): x is B => x instanceof B));
  };
}

{
  type Indexed<T> = Seq.Indexed<T>;
  type Keyed<K, V> = Seq.Keyed<K, V>;
  type Set<T> = Seq.Set<T>;

  (c: Seq<string, number>) => {
    expectType<[Seq<string, number>, Seq<string, number>]>(
      c.partition(x => x % 2)
    );
  };

  (c: Seq<string, A>) => {
    expectType<[Seq<string, A>, Seq<string, B>]>(
      c.partition((x): x is B => x instanceof B)
    );
  };

  (c: Keyed<string, number>) => {
    expectType<[Keyed<string, number>, Keyed<string, number>]>(
      c.partition(x => x % 2)
    );
  };

  (c: Keyed<string, A>) => {
    expectType<[Keyed<string, A>, Keyed<string, B>]>(
      c.partition((x): x is B => x instanceof B)
    );
  };

  (c: Indexed<number>) => {
    expectType<[Indexed<number>, Indexed<number>]>(c.partition(x => x % 2));
  };

  (c: Indexed<A>) => {
    expectType<[Indexed<A>, Indexed<B>]>(
      c.partition((x): x is B => x instanceof B)
    );
  };

  (c: Set<number>) => {
    expectType<[Set<number>, Set<number>]>(c.partition(x => x % 2));
  };

  (c: Set<A>) => {
    expectType<[Set<A>, Set<B>]>(c.partition((x): x is B => x instanceof B));
  };
}

(c: Map<string, number>) => {
  expectType<[Map<string, number>, Map<string, number>]>(
    c.partition(x => x % 2)
  );
};

(c: Map<string, A>) => {
  expectType<[Map<string, A>, Map<string, B>]>(
    c.partition((x): x is B => x instanceof B)
  );
};

(c: OrderedMap<string, number>) => {
  expectType<[OrderedMap<string, number>, OrderedMap<string, number>]>(
    c.partition(x => x % 2)
  );
};

(c: OrderedMap<string, A>) => {
  expectType<[OrderedMap<string, A>, OrderedMap<string, B>]>(
    c.partition((x): x is B => x instanceof B)
  );
};

(c: List<number>) => {
  expectType<[List<number>, List<number>]>(c.partition(x => x % 2));
};

(c: List<A>) => {
  expectType<[List<A>, List<B>]>(c.partition((x): x is B => x instanceof B));
};

(c: Set<number>) => {
  expectType<[Set<number>, Set<number>]>(c.partition(x => x % 2));
};

(c: Set<A>) => {
  expectType<[Set<A>, Set<B>]>(c.partition((x): x is B => x instanceof B));
};

(c: OrderedSet<number>) => {
  expectType<[OrderedSet<number>, OrderedSet<number>]>(c.partition(x => x % 2));
};

(c: OrderedSet<A>) => {
  expectType<[OrderedSet<A>, OrderedSet<B>]>(
    c.partition((x): x is B => x instanceof B)
  );
};
