///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();

import Immutable = require('../dist/Immutable');

jasmine.getEnv().addEqualityTester((a, b) =>
  a instanceof Immutable.Sequence && b instanceof Immutable.Sequence ?
    Immutable.is(a, b) :
    jasmine.undefined
);

describe('Cursor', () => {

  var json = { a: { b: { c: 1 } } };

  it('gets from its path', () => {
    var data = Immutable.fromJS(json);
    var cursor = data.cursor();

    expect(cursor.get()).toBe(data);

    var deepCursor = cursor.cursor(['a', 'b']);
    expect(deepCursor.get().toJS()).toEqual(json.a.b);
    expect(deepCursor.get()).toBe(data.getIn(['a', 'b']));

    var leafCursor = deepCursor.cursor('c');
    expect(leafCursor.get()).toBe(1);

    var missCursor = leafCursor.cursor('d');
    expect(missCursor.get()).toBe(Immutable.Map.empty());
  });

  it('updates at its path', () => {
    var onChange = jest.genMockFunction();

    var data = Immutable.fromJS(json);
    var cursor = data.cursor(onChange);

    var deepCursor = cursor.cursor(['a', 'b', 'c']);
    expect(deepCursor.get()).toBe(1);

    // cursor edits return new cursors:
    var newDeepCursor = deepCursor.update(x => x + 1);
    expect(newDeepCursor.get()).toBe(2);
    expect(onChange).lastCalledWith(
      Immutable.fromJS({a:{b:{c:2}}}),
      data
    );

    var newestDeepCursor = newDeepCursor.update(x => x + 1);
    expect(newestDeepCursor.get()).toBe(3);
    expect(onChange).lastCalledWith(
      Immutable.fromJS({a:{b:{c:3}}}),
      Immutable.fromJS({a:{b:{c:2}}})
    );

    // meanwhile, data is still immutable:
    expect(data.toJS()).toEqual(json);

    // as is the original cursor.
    expect(deepCursor.get()).toBe(1);
    var otherNewDeepCursor = deepCursor.update(x => x + 10);
    expect(otherNewDeepCursor.get()).toBe(11);
    expect(onChange).lastCalledWith(
      Immutable.fromJS({a:{b:{c:11}}}),
      data
    );

    // and update has been called exactly thrice.
    expect(onChange.mock.calls.length).toBe(3);
  });

});
