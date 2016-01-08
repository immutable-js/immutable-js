///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { Iterable, Seq, Range, List, fromJS } from 'immutable';

type SeqType = number | number[] | Iterable<number,number>;

describe('flatten', () => {

  it('flattens sequences one level deep', () => {
    var nested = fromJS([[1,2],[3,4],[5,6]]);
    var flat = nested.flatten();
    expect(flat.toJS()).toEqual([1,2,3,4,5,6]);
  })

  it('flattening a List returns a List', () => {
    var nested = fromJS([[1],2,3,[4,5,6]]);
    var flat = nested.flatten();
    expect(flat.toString()).toEqual("List [ 1, 2, 3, 4, 5, 6 ]");
  })

  it('gives the correct iteration count', () => {
    var nested = fromJS([[1,2,3],[4,5,6]]);
    var flat = nested.flatten();
    expect(flat.forEach(x => x < 4)).toEqual(4);
  })

  it('flattens only Sequences (not sequenceables)', () => {
    var nested = Seq.of<SeqType>(Range(1,3),[3,4],List.of(5,6,7),8);
    var flat = nested.flatten();
    expect(flat.toJS()).toEqual([1,2,[3,4],5,6,7,8]);
  })

  it('can be reversed', () => {
    var nested = Seq.of<SeqType>(Range(1,3),[3,4],List.of(5,6,7),8);
    var flat = nested.flatten();
    var reversed = flat.reverse();
    expect(reversed.toJS()).toEqual([8,7,6,5,[3,4],2,1]);
  })

  it('can flatten at various levels of depth', () => {
    var deeplyNested = fromJS(
      [
        [
          [
            [ 'A', 'B' ],
            [ 'A', 'B' ],
          ],
          [
            [ 'A', 'B' ],
            [ 'A', 'B' ],
          ],
        ],
        [
          [
            [ 'A', 'B' ],
            [ 'A', 'B' ],
          ],
          [
            [ 'A', 'B' ],
            [ 'A', 'B' ],
          ]
        ]
      ]
    );

    // deeply flatten
    expect(deeplyNested.flatten().toJS()).toEqual(
      ['A','B','A','B','A','B','A','B','A','B','A','B','A','B','A','B']
    );

    // shallow flatten
    expect(deeplyNested.flatten(true).toJS()).toEqual(
      [
        [
          [ 'A', 'B' ],
          [ 'A', 'B' ],
        ],
        [
          [ 'A', 'B' ],
          [ 'A', 'B' ],
        ],
        [
          [ 'A', 'B' ],
          [ 'A', 'B' ],
        ],
        [
          [ 'A', 'B' ],
          [ 'A', 'B' ],
        ]
      ]
    );

    // flatten two levels
    expect(deeplyNested.flatten(2).toJS()).toEqual(
      [
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ]
      ]
    );
  });

  describe('flatMap', () => {

    it('first maps, then shallow flattens', () => {
      var numbers = Range(97, 100);
      var letters = numbers.flatMap(v => fromJS([
        String.fromCharCode(v),
        String.fromCharCode(v).toUpperCase(),
      ]));
      expect(letters.toJS()).toEqual(
        ['a','A','b','B','c','C']
      )
    });

    it('maps to sequenceables, not only Sequences.', () => {
      var numbers = Range(97, 100);
      // the map function returns an Array, rather than an Iterable.
      // Array is sequenceable, so this works just fine.
      var letters = numbers.flatMap(v => [
        String.fromCharCode(v),
        String.fromCharCode(v).toUpperCase()
      ]);
      expect(letters.toJS()).toEqual(
        ['a','A','b','B','c','C']
      )
    });

  });

});
