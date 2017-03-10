import * as jasmineCheck from 'jasmine-check';
import { List, Range, Seq } from '../';
jasmineCheck.install();

describe('splice', () => {
  it('splices a sequence only removing elements', () => {
    expect(Seq.of(1, 2, 3).splice(0, 1).toArray()).toEqual([2, 3]);
    expect(Seq.of(1, 2, 3).splice(1, 1).toArray()).toEqual([1, 3]);
    expect(Seq.of(1, 2, 3).splice(2, 1).toArray()).toEqual([1, 2]);
    expect(Seq.of(1, 2, 3).splice(3, 1).toArray()).toEqual([1, 2, 3]);
  });

  it('splices a list only removing elements', () => {
    expect(List.of(1, 2, 3).splice(0, 1).toArray()).toEqual([2, 3]);
    expect(List.of(1, 2, 3).splice(1, 1).toArray()).toEqual([1, 3]);
    expect(List.of(1, 2, 3).splice(2, 1).toArray()).toEqual([1, 2]);
    expect(List.of(1, 2, 3).splice(3, 1).toArray()).toEqual([1, 2, 3]);
  });

  it('splicing by infinity', () => {
    let l = List(['a', 'b', 'c', 'd']);
    expect(l.splice(2, Infinity, 'x').toArray()).toEqual(['a', 'b', 'x']);
    expect(l.splice(Infinity, 2, 'x').toArray()).toEqual(['a', 'b', 'c', 'd', 'x']);

    let s = List(['a', 'b', 'c', 'd']);
    expect(s.splice(2, Infinity, 'x').toArray()).toEqual(['a', 'b', 'x']);
    expect(s.splice(Infinity, 2, 'x').toArray()).toEqual([ 'a', 'b', 'c', 'd', 'x']);
  });

  it('has the same behavior as array splice in known edge cases', () => {
    // arbitary numbers that sum to 31
    let a = Range(0, 49).toArray();
    let v = List(a);
    a.splice(-18, 0, 0);
    expect(v.splice(-18, 0, 0).toList().toArray()).toEqual(a);
  });

  check.it(
    'has the same behavior as array splice',
    [gen.array(gen.int), gen.array(gen.oneOf([gen.int, gen.undefined]))],
    (values, args) => {
      let v = List(values);
      let a = values.slice(); // clone
      let splicedV = v.splice.apply(v, args); // persistent
      a.splice.apply(a, args); // mutative
      expect(splicedV.toArray()).toEqual(a);
    },
  );
});
