jest.autoMockOff();

var Immutable1 = require('../');
jest.resetModuleRegistry();
var Immutable2 = require('../');

describe('MultiRequire', () => {

  it('might require two different instances of Immutable', () => {
    expect(Immutable1).not.toBe(Immutable2);
    expect(Immutable1.Map({a: 1}).toJS()).toEqual({a: 1});
    expect(Immutable2.Map({a: 1}).toJS()).toEqual({a: 1});
  });

  it('detects sequences', () => {
    var x = Immutable1.Map({a: 1});
    var y = Immutable2.Map({a: 1});
    expect(Immutable1.Sequence.isSequence(y)).toBe(true);
    expect(Immutable2.Sequence.isSequence(x)).toBe(true);
  });

  it('converts to JS when inter-nested', () => {
    var deep = Immutable1.Map({
      a: 1,
      b: 2,
      c: Immutable2.Map({
        x: 3,
        y: 4,
        z: Immutable1.Map()
      })
    });

    expect(deep.toJS()).toEqual({
      a: 1,
      b: 2,
      c: {
        x: 3,
        y: 4,
        z: {}
      }
    });
  });

  it('compares for equality', () => {
    var x = Immutable1.Map({a: 1});
    var y = Immutable2.Map({a: 1});
    expect(Immutable1.is(x, y)).toBe(true);
    expect(Immutable2.is(x, y)).toBe(true);
  });

  it('flattens nested values', () => {
    var nested = Immutable1.Vector(
      Immutable2.Vector(
        Immutable1.Vector(
          Immutable2.Vector.of(1, 2)
        )
      )
    );

    expect(nested.flatten().toJS()).toEqual([1,2]);
  });

});
