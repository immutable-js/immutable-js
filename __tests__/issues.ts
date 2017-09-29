
///<reference path='../resources/jest.d.ts'/>

declare var Symbol: any;
import { Seq } from '../';

describe('Issue #1220 : Seq.rest() throws an exception when invoked on a single item sequence ', () => {
  it('should be iterable', () => {
    let r = Seq([1]).rest();
    let i = r[ITERATOR_SYMBOL]();
    expect(i.next()).toEqual({ value: undefined, done: true });
  });
});

// Helper for this test
let ITERATOR_SYMBOL =
  typeof Symbol === 'function' && Symbol.iterator || '@@iterator';
