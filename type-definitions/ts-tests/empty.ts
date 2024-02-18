import { expectType } from 'tsd';
import { Seq, Collection } from 'immutable';

{
  // Typed empty seqs

  expectType<Seq<unknown, unknown>>(Seq());

  expectType<Seq<number, string>>(Seq<number, string>());

  expectType<Seq.Indexed<unknown>>(Seq.Indexed());

  expectType<Seq.Indexed<string>>(Seq.Indexed<string>());

  expectType<Seq.Keyed<unknown, unknown>>(Seq.Keyed());

  expectType<Seq.Keyed<number, string>>(Seq.Keyed<number, string>());

  expectType<Seq.Set<unknown>>(Seq.Set());

  expectType<Seq.Set<string>>(Seq.Set<string>());
}

{
  // Typed empty collection

  expectType<Collection<unknown, unknown>>(Collection());

  expectType<Collection<number, string>>(Collection<number, string>());

  expectType<Collection.Indexed<unknown>>(Collection.Indexed());

  expectType<Collection.Indexed<string>>(Collection.Indexed<string>());

  expectType<Collection.Keyed<unknown, unknown>>(Collection.Keyed());

  expectType<Collection.Keyed<number, string>>(Collection.Keyed<number, string>());

  expectType<Collection.Set<unknown>>(Collection.Set());

  expectType<Collection.Set<string>>(Collection.Set<string>());
}
