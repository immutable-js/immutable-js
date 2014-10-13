///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/Immutable.d.ts'/>
jest.autoMockOff();

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

import Immutable = require('immutable');

describe('IndexedSequence', () => {

  it('maintains skipped offset', () => {
    var seq = Immutable.Sequence(['A', 'B', 'C', 'D', 'E']);

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

});
