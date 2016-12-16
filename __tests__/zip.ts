///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { Iterable, List, Range, Seq } from 'immutable';

describe('zip', () => {

  it('zips lists into a list of tuples', () => {
    expect(
      Seq.of(1,2,3).zip(Seq.of(4,5,6)).toArray()
    ).toEqual(
      [[1,4],[2,5],[3,6]]
    );
  });

  it('zips with infinite lists', () => {
    expect(
      Range().zip(Seq.of('A','B','C')).toArray()
    ).toEqual(
      [[0,'A'],[1,'B'],[2,'C']]
    );
  });

  it('has unknown size when zipped with unknown size', () => {
    var seq = Range(0, 10);
    var zipped = seq.zip(seq.filter(n => n % 2 === 0));
    expect(zipped.size).toBe(undefined);
    expect(zipped.count()).toBe(5);
  })

  check.it('is always the size of the smaller sequence',
    [gen.notEmpty(gen.array(gen.posInt))], (lengths) => {
      var ranges = lengths.map(l => Range(0, l));
      var first = ranges.shift();
      var zipped = first.zip.apply(first, ranges);
      var shortestLength = Math.min.apply(Math, lengths);
      expect(zipped.size).toBe(shortestLength);
  });

  describe('zipWith', () => {

    it('zips with a custom function', () => {
      expect(
        Seq.of(1,2,3).zipWith<number, number>(
          (a, b) => a + b,
          Seq.of(4,5,6)
        ).toArray()
      ).toEqual(
        [5,7,9]
      );
    });

    it('can zip to create immutable collections', () => {
      expect(
        Seq.of(1,2,3).zipWith(
          function () { return List(arguments); },
          Seq.of(4,5,6),
          Seq.of(7,8,9)
        ).toJS()
      ).toEqual(
        [[1,4,7],[2,5,8],[3,6,9]]
      );
    });

  });

  describe('interleave', () => {

    it('interleaves multiple collections', () => {
      expect(
        Seq.of(1,2,3).interleave(
          Seq.of(4,5,6),
          Seq.of(7,8,9)
        ).toArray()
      ).toEqual(
        [1,4,7,2,5,8,3,6,9]
      );
    });

    it('stops at the shortest collection', () => {
      var i = Seq.of(1,2,3).interleave(
        Seq.of(4,5),
        Seq.of(7,8,9)
      );
      expect(i.size).toBe(6);
      expect(i.toArray()).toEqual(
        [1,4,7,2,5,8]
      );
    });

    it('with infinite lists', () => {
      var r: Iterable.Indexed<any> = Range();
      var i = r.interleave(Seq.of('A','B','C'));
      expect(i.size).toBe(6);
      expect(i.toArray()).toEqual(
        [0,'A',1,'B',2,'C']
      );
    });

  });

});
