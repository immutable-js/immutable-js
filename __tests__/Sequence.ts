///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/Immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');

describe('Sequence', () => {

  it('can be empty', () => {
    expect(Immutable.Sequence().length).toBe(0);
  });

  it('accepts an array', () => {
    expect(Immutable.Sequence([1,2,3]).length).toBe(3);
  });

  it('accepts varargs', () => {
    expect(Immutable.Sequence(1,2,3).length).toBe(3);
  });

  it('accepts another sequence', () => {
    var seq = Immutable.Sequence(1,2,3);
    expect(Immutable.Sequence(seq).length).toBe(3);
  });

});
