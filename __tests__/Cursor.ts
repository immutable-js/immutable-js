///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');

jasmine.getEnv().addEqualityTester((a, b) =>
  a instanceof Immutable.Iterable && b instanceof Immutable.Iterable ?
    Immutable.is(a, b) :
    jasmine.undefined
);

describe('Cursor', () => {

  var json = { a: { b: { c: 1 } } };

  it('gets from its path', () => {
    var data = Immutable.fromJS(json);
    var cursor = data.cursor();

    expect(cursor.deref()).toBe(data);

    var deepCursor = cursor.cursor(['a', 'b']);
    expect(deepCursor.deref().toJS()).toEqual(json.a.b);
    expect(deepCursor.deref()).toBe(data.getIn(['a', 'b']));
    expect(deepCursor.get('c')).toBe(1);

    var leafCursor = deepCursor.cursor('c');
    expect(leafCursor.deref()).toBe(1);

    var missCursor = leafCursor.cursor('d');
    expect(missCursor.deref()).toBe(undefined);
  });

  it('gets return new cursors', () => {
    var data = Immutable.fromJS(json);
    var cursor = data.cursor();
    var deepCursor = cursor.getIn(['a', 'b']);
    expect(deepCursor.deref()).toBe(data.getIn(['a', 'b']));
  });

  it('can be treated as a value', () => {
    var data = Immutable.fromJS(json);
    var cursor = data.cursor(['a', 'b']);
    expect(cursor.toJS()).toEqual(json.a.b);
    expect(cursor).toEqual(data.getIn(['a', 'b']));
    expect(cursor.size).toBe(1);
    expect(cursor.get('c')).toBe(1);
  });

  it('can be value compared to a primitive', () => {
    var data = Immutable.Map({ a: 'A' });
    var aCursor = data.cursor('a');
    expect(aCursor.size).toBe(undefined);
    expect(aCursor.deref()).toBe('A');
    expect(Immutable.is(aCursor, 'A')).toBe(true);
  });

  it('updates at its path', () => {
    var onChange = jest.genMockFunction();

    var data = Immutable.fromJS(json);
    var aCursor = data.cursor('a', onChange);

    var deepCursor = aCursor.cursor(['b', 'c']);
    expect(deepCursor.deref()).toBe(1);

    // cursor edits return new cursors:
    var newDeepCursor = deepCursor.update(x => x + 1);
    expect(newDeepCursor.deref()).toBe(2);
    expect(onChange).lastCalledWith(
      Immutable.fromJS({a:{b:{c:2}}}),
      data,
      ['a', 'b', 'c']
    );

    var newestDeepCursor = newDeepCursor.update(x => x + 1);
    expect(newestDeepCursor.deref()).toBe(3);
    expect(onChange).lastCalledWith(
      Immutable.fromJS({a:{b:{c:3}}}),
      Immutable.fromJS({a:{b:{c:2}}}),
      ['a', 'b', 'c']
    );

    // meanwhile, data is still immutable:
    expect(data.toJS()).toEqual(json);

    // as is the original cursor.
    expect(deepCursor.deref()).toBe(1);
    var otherNewDeepCursor = deepCursor.update(x => x + 10);
    expect(otherNewDeepCursor.deref()).toBe(11);
    expect(onChange).lastCalledWith(
      Immutable.fromJS({a:{b:{c:11}}}),
      data,
      ['a', 'b', 'c']
    );

    // and update has been called exactly thrice.
    expect(onChange.mock.calls.length).toBe(3);
  });

  it('has map API for update shorthand', () => {
    var onChange = jest.genMockFunction();

    var data = Immutable.fromJS(json);
    var aCursor = data.cursor('a', onChange);
    var bCursor = aCursor.cursor('b');
    var cCursor = bCursor.cursor('c');

    expect(bCursor.set('c', 10).deref()).toEqual(
      Immutable.fromJS({ c: 10 })
    );
    expect(onChange).lastCalledWith(
      Immutable.fromJS({ a: { b: { c: 10 } } }),
      data,
      ['a', 'b', 'c']
    );
  });

  it('creates maps as necessary', () => {
    var data = Immutable.Map();
    var cursor = data.cursor(['a', 'b', 'c']);
    expect(cursor.deref()).toBe(undefined);
    cursor = cursor.set('d', 3);
    expect(cursor.deref()).toEqual(Immutable.Map({d: 3}));
  });

  it('has the sequence API', () => {
    var data = Immutable.Map({a: 1, b: 2, c: 3});
    var cursor = data.cursor();
    expect(cursor.map(x => x * x)).toEqual(Immutable.Map({a: 1, b: 4, c: 9}));
  });

  it('returns wrapped values for sequence API', () => {
    var data = Immutable.fromJS({a: {v: 1}, b: {v: 2}, c: {v: 3}});
    var onChange = jest.genMockFunction();
    var cursor = data.cursor(onChange);

    var found = cursor.find(map => map.get('v') === 2);
    expect(typeof found.deref).toBe('function'); // is a cursor!
    found = found.set('v', 20);
    expect(onChange).lastCalledWith(
      Immutable.fromJS({a: {v: 1}, b: {v: 20}, c: {v: 3}}),
      data,
      ['b', 'v']
    );
  });

  it('can map over values to get subcursors', () => {
    var data = Immutable.fromJS({a: {v: 1}, b: {v: 2}, c: {v: 3}});
    var cursor = data.cursor();

    var mapped = cursor.map(val => {
      expect(typeof val.deref).toBe('function'); // mapped values are cursors.
      return val;
    }).toMap();
    // Mapped is not a cursor, but it is a sequence of cursors.
    expect(typeof mapped.deref).not.toBe('function');
    expect(typeof mapped.get('a').deref).toBe('function');

    // Same for indexed cursors
    var data2 = Immutable.fromJS({x: [{v: 1}, {v: 2}, {v: 3}]});
    var cursor2 = data2.cursor();

    var mapped2 = cursor2.get('x').map(val => {
      expect(typeof val.deref).toBe('function'); // mapped values are cursors.
      return val;
    }).toVector();
    // Mapped is not a cursor, but it is a sequence of cursors.
    expect(typeof mapped2.deref).not.toBe('function');
    expect(typeof mapped2.get(0).deref).toBe('function');
  });

  it('can have mutations apply with a single callback', () => {
    var onChange = jest.genMockFunction();
    var data = Immutable.fromJS({'a': 1});

    var c1 = data.cursor(onChange);
    var c2 = c1.withMutations(m => m.set('b', 2).set('c', 3).set('d', 4));

    expect(c1.deref().toObject()).toEqual({'a': 1});
    expect(c2.deref().toObject()).toEqual({'a': 1, 'b': 2, 'c': 3, 'd': 4});
    expect(onChange.mock.calls.length).toBe(1);
  });

  it('can use withMutations on an unfulfilled cursor', () => {
    var onChange = jest.genMockFunction();
    var data = Immutable.fromJS({});

    var c1 = data.cursor(['a', 'b', 'c'], onChange);
    var c2 = c1.withMutations(m => m.set('x', 1).set('y', 2).set('z', 3));

    expect(c1.deref()).toEqual(undefined);
    expect(c2.deref()).toEqual(Immutable.fromJS(
      { x: 1, y: 2, z: 3 }
    ));
    expect(onChange.mock.calls.length).toBe(1);
  });

  it('maintains indexed sequences', () => {
    var data = Immutable.fromJS([]);
    var c = data.cursor();
    expect(c.toJS()).toEqual([]);
  });

});
