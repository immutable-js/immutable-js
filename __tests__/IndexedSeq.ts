///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>
jest.autoMockOff();

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

import Immutable = require('immutable');

describe('IndexedSequence', () => {

  it('maintains skipped offset', () => {
    var seq = Immutable.Seq(['A', 'B', 'C', 'D', 'E']);

    // This is what we expect for IndexedSequences
    var operated = seq.skip(1);
    expect(operated.entrySeq().toArray()).toEqual([
      [0, 'B'],
      [1, 'C'],
      [2, 'D'],
      [3, 'E']
    ]);

    expect(operated.first()).toEqual('B');
  });

  it('reverses correctly', () => {
    var seq = Immutable.Seq(['A', 'B', 'C', 'D', 'E']);

    // This is what we expect for IndexedSequences
    var operated = seq.reverse();
    expect(operated.get(0)).toEqual('E');
    expect(operated.get(1)).toEqual('D');
    expect(operated.get(4)).toEqual('A');

    expect(operated.first()).toEqual('E');
    expect(operated.last()).toEqual('A');
  });
});
