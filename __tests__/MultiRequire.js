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
    expect(Immutable1.Iterable.isIterable(y)).toBe(true);
    expect(Immutable2.Iterable.isIterable(x)).toBe(true);
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
    var nested = Immutable1.List(
      Immutable2.List(
        Immutable1.List(
          Immutable2.List.of(1, 2)
        )
      )
    );

    expect(nested.flatten().toJS()).toEqual([1,2]);
  });

  it('detects types', () => {
    var c1 = Immutable1.Map();
    var c2 = Immutable2.Map();
    expect(Immutable1.Map.isMap(c2)).toBe(true);
    expect(Immutable2.Map.isMap(c1)).toBe(true);

    var c1 = Immutable1.OrderedMap();
    var c2 = Immutable2.OrderedMap();
    expect(Immutable1.OrderedMap.isOrderedMap(c2)).toBe(true);
    expect(Immutable2.OrderedMap.isOrderedMap(c1)).toBe(true);

    var c1 = Immutable1.List();
    var c2 = Immutable2.List();
    expect(Immutable1.List.isList(c2)).toBe(true);
    expect(Immutable2.List.isList(c1)).toBe(true);

    var c1 = Immutable1.Stack();
    var c2 = Immutable2.Stack();
    expect(Immutable1.Stack.isStack(c2)).toBe(true);
    expect(Immutable2.Stack.isStack(c1)).toBe(true);

    var c1 = Immutable1.Set();
    var c2 = Immutable2.Set();
    expect(Immutable1.Set.isSet(c2)).toBe(true);
    expect(Immutable2.Set.isSet(c1)).toBe(true);
  });

});
