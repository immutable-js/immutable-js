///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Persistent = require('../dist/Persistent');

describe('Sequence', () => {

  it('can be empty', () => {
    expect(Persistent.Sequence().length).toBe(0);
  });

  it('accepts an array', () => {
    expect(Persistent.Sequence([1,2,3]).length).toBe(3);
  });

  it('accepts varargs', () => {
    expect(Persistent.Sequence(1,2,3).length).toBe(3);
  });

  it('accepts another sequence', () => {
    var seq = Persistent.Sequence(1,2,3);
    expect(Persistent.Sequence(seq).length).toBe(3);
  });

});
