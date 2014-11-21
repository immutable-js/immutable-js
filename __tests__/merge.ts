///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

describe('merge', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        return I.is(this.actual, expected);
      }
    })
  })

  it('merges two maps', () => {
    var m1 = I.Map({a:1,b:2,c:3});
    var m2 = I.Map({d:10,b:20,e:30});
    expect(m1.merge(m2)).is(I.Map({a:1,b:20,c:3,d:10,e:30}));
  })

  it('can merge in an explicitly undefined value', () => {
    var m1 = I.Map({a:1,b:2});
    var m2 = I.Map({a:undefined});
    expect(m1.merge(m2)).is(I.Map({a:undefined,b:2}));
  })

  it('merges two maps with a merge function', () => {
    var m1 = I.Map({a:1,b:2,c:3});
    var m2 = I.Map({d:10,b:20,e:30});
    expect(m1.mergeWith((a, b) => a + b, m2)).is(I.Map({a:1,b:22,c:3,d:10,e:30}));
  })

  it('deep merges two maps', () => {
    var m1 = I.fromJS({a:{b:{c:1,d:2}}});
    var m2 = I.fromJS({a:{b:{c:10,e:20},f:30},g:40});
    expect(m1.mergeDeep(m2)).is(I.fromJS({a:{b:{c:10,d:2,e:20},f:30},g:40}));
  })

  it('deep merges raw JS', () => {
    var m1 = I.fromJS({a:{b:{c:1,d:2}}});
    var js = {a:{b:{c:10,e:20},f:30},g:40};
    expect(m1.mergeDeep(js)).is(I.fromJS({a:{b:{c:10,d:2,e:20},f:30},g:40}));
  })

  it('deep merges raw JS with a merge function', () => {
    var m1 = I.fromJS({a:{b:{c:1,d:2}}});
    var js = {a:{b:{c:10,e:20},f:30},g:40};
    expect(
      m1.mergeDeepWith((a, b) => a + b, js)
    ).is(I.fromJS(
      {a:{b:{c:11,d:2,e:20},f:30},g:40}
    ));
  })

  it('returns self when a deep merges is a no-op', () => {
    var m1 = I.fromJS({a:{b:{c:1,d:2}}});
    expect(
      m1.mergeDeep({a:{b:{c:1}}})
    ).toBe(m1);
  })

  it('returns arg when a deep merges is a no-op', () => {
    var m1 = I.fromJS({a:{b:{c:1,d:2}}});
    expect(
      I.Map().mergeDeep(m1)
    ).toBe(m1);
  })

  it('can overwrite existing maps', () => {
    expect(
      I.fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } })
        .merge({ a: null, b: { x: 10 } })
        .toJS()
    ).toEqual(
      { a: null, b: { x: 10 } }
    );
    expect(
      I.fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } })
        .mergeDeep({ a: null, b: { x: 10 } })
        .toJS()
    ).toEqual(
      { a: null, b: { x: 10, y: 2 } }
    );
  })

  it('can overwrite existing maps with objects', () => {
    var m1 = I.fromJS({ a: { x: 1, y: 1 } }); // deep conversion.
    var m2 = I.Map({ a: { z: 10 } }); // shallow conversion to Map.

    // raw object simply replaces map.
    expect(m1.merge(m2).get('a')).toEqual({z: 10}) // raw object.
    expect(m1.mergeDeep(m2).get('a')).toEqual({z: 10}) // raw object.
  })

  it('merges map entries with Vector values', () => {
    expect(
      I.fromJS({a:[1]}).merge({b:[2]})
    ).is(I.fromJS(
      {a:[1], b:[2]}
    ));
    expect(
      I.fromJS({a:[1]}).mergeDeep({b:[2]})
    ).is(I.fromJS(
      {a:[1], b:[2]}
    ));
  })

  it('maintains JS values inside immutable collections', () => {
    var m1 = I.fromJS({a:{b:[{imm:'map'}]}});
    var m2 = m1.mergeDeep(
      I.Map({a: I.Map({b: I.List.of( {plain:'obj'} )})})
    );

    expect(m1.getIn(['a', 'b', 0])).is(I.Map([['imm', 'map']]));
    expect(m2.getIn(['a', 'b', 0])).toEqual({plain: 'obj'});
  })

})
