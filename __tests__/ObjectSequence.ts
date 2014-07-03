///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Persistent = require('../dist/Persistent');

describe('ObjectSequence', function() {

  it('maps', function() {
    var i = Persistent.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var m = i.map(x => x + x).toObject();
    expect(m).toEqual({'a': 'AA', 'b': 'BB', 'c': 'CC'});
  });

  it('reduces', function() {
    var i = Persistent.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var r = i.reduce<string>((r, x) => r + x, '');
    expect(r).toEqual('ABC');
  });

  it('extracts keys', function() {
    var i = Persistent.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var k = i.keys().toArray();
    expect(k).toEqual(['a', 'b', 'c']);
  });

  it('is reversable', function() {
    var i = Persistent.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var k = i.reverse().toArray();
    expect(k).toEqual(['C', 'B', 'A']);
  });

});
