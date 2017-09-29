
///<reference path='../resources/jest.d.ts'/>

declare var Symbol: any;
import { List, OrderedMap, Seq } from '../';

describe('Issue #1220 : Seq.rest() throws an exception when invoked on a single item sequence ', () => {
  it('should be iterable', () => {
    // Helper for this test
    const ITERATOR_SYMBOL =
      typeof Symbol === 'function' && Symbol.iterator || '@@iterator';

    const r = Seq([1]).rest();
    const i = r[ITERATOR_SYMBOL]();
    expect(i.next()).toEqual({ value: undefined, done: true });
  });
});

describe('Issue #1245', () => {
  it('should return empty collection after takeLast(0)', () => {
    const size = List(['a', 'b', 'c']).takeLast(0).size;
    expect(size).toEqual(0);
  });
});

describe('Issue #1287', () => {
  it('should skip all items in OrderedMap when skipping Infinity', () => {
    const size = OrderedMap([['a', 1]]).skip(Infinity).size;
    expect(size).toEqual(0);
  });
});
