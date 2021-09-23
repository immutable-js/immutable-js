import { Seq, Collection } from 'immutable';

{
  // Typed empty seqs

  // $ExpectType Seq<unknown, unknown>
  Seq();

  // $ExpectType Seq<number, string>
  Seq<number, string>();

  // $ExpectType Indexed<unknown>
  Seq.Indexed();

  // $ExpectType Indexed<string>
  Seq.Indexed<string>();

  // $ExpectType Keyed<unknown, unknown>
  Seq.Keyed();

  // $ExpectType Keyed<number, string>
  Seq.Keyed<number, string>();

  // $ExpectType Set<unknown>
  Seq.Set();

  // $ExpectType Set<string>
  Seq.Set<string>();
}

{
  // Typed empty collection

  // $ExpectType Collection<unknown, unknown>
  Collection();

  // $ExpectType Collection<number, string>
  Collection<number, string>();

  // $ExpectType Indexed<unknown>
  Collection.Indexed();

  // $ExpectType Indexed<string>
  Collection.Indexed<string>();

  // $ExpectType Keyed<unknown, unknown>
  Collection.Keyed();

  // $ExpectType Keyed<number, string>
  Collection.Keyed<number, string>();

  // $ExpectType Set<unknown>
  Collection.Set();

  // $ExpectType Set<string>
  Collection.Set<string>();
}
