///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import { List, Map, fromJS, is } from 'immutable';

declare function expect(val: any): ExpectWithIs;

interface ExpectWithIs extends Expect {
  is(expected: any): void;
  not: ExpectWithIs;
}

describe('merge', () => {

  beforeEach(function () {
    this.addMatchers({
      is: function(expected) {
        return is(this.actual, expected);
      }
    })
  })

  it('merges two maps', () => {
    var m1 = Map({a:1,b:2,c:3});
    var m2 = Map({d:10,b:20,e:30});
    expect(m1.merge(m2)).is(Map({a:1,b:20,c:3,d:10,e:30}));
  })

  it('can merge in an explicitly undefined value', () => {
    var m1 = Map({a:1,b:2});
    var m2 = Map({a:undefined});
    expect(m1.merge(m2)).is(Map({a:undefined,b:2}));
  })

  it('merges two maps with a merge function', () => {
    var m1 = Map({a:1,b:2,c:3});
    var m2 = Map({d:10,b:20,e:30});
    expect(m1.mergeWith((a, b) => a + b, m2)).is(Map({a:1,b:22,c:3,d:10,e:30}));
  })

  it('provides key as the third argument of merge function', () => {
    var m1 = Map({id:'temp',  b:2,  c:3});
    var m2 = Map({id:10,  b:20, e:30});
    var add = (a, b) => a + b
    expect(
      m1.mergeWith((a, b, key) => key !== 'id' ? add(a, b) : b, m2)
    ).is(Map({id:10,b:22,c:3,e:30}));
  })

  it('provides keyPath as the fourth argument of merge function', () => {
    var m1 = fromJS({a:{b:{c:1,d:2},f:3}});
    var js = fromJS({a:{b:{c:10,e:20},f:30},g:40});
    expect(
      m1.mergeDeepWith((a, b, index, keyPath) => keyPath.join(''), js)
    ).is(
      fromJS({a:{b:{c:'abc',d:2,e:20},f:'af'},g:40})
    );
  })

  it('deep merges multiple iterables using the keyPath', () => {
    var m1 = fromJS({a:{b:{c:1,d:2},f:3}});
    var m2 = fromJS({a:{b:{c:10,e:20},f:30},g:40});
    var m3 = fromJS({a:{b:{c:100,e:200},f:300},g:400,h:500});
    expect(
      m1.mergeDeepWith(
        (a, b, index, keyPath) => keyPath.indexOf('b') > -1 ? b : a, m2, m3
      )
    ).is(fromJS({a:{b:{c:100,d:2,e:200},f:3},g:40,h:500}));
  })

  it('deep merges lists using the keyPath', () => {
    var l1 = fromJS([[0,1,2],3,4]);
    var l2 = fromJS([[10,11,12],13]);
    expect(
      l1.mergeDeepWith(
        (a, b, index, keyPath) => keyPath.indexOf(1) > -1 ? b : a, l2
      )
    ).is(fromJS([[0,11,2],13,4]));
  })

  it('deep merges two maps', () => {
    var m1 = fromJS({a:{b:{c:1,d:2}}});
    var m2 = fromJS({a:{b:{c:10,e:20},f:30},g:40});
    expect(m1.mergeDeep(m2)).is(fromJS({a:{b:{c:10,d:2,e:20},f:30},g:40}));
  })

  it('deep merge uses is() for return-self optimization', () =>  {
    var date1 = new Date(1234567890000);
    var date2 = new Date(1234567890000);
    var m = Map().setIn(['a', 'b', 'c'], date1);
    var m2 = m.mergeDeep({a:{b:{c: date2 }}});
    expect(m2 === m).toBe(true);
  })

  it('deep merges raw JS', () => {
    var m1 = fromJS({a:{b:{c:1,d:2}}});
    var js = {a:{b:{c:10,e:20},f:30},g:40};
    expect(m1.mergeDeep(js)).is(fromJS({a:{b:{c:10,d:2,e:20},f:30},g:40}));
  })

  it('deep merges raw JS with a merge function', () => {
    var m1 = fromJS({a:{b:{c:1,d:2}}});
    var js = {a:{b:{c:10,e:20},f:30},g:40};
    expect(
      m1.mergeDeepWith((a, b) => a + b, js)
    ).is(fromJS(
      {a:{b:{c:11,d:2,e:20},f:30},g:40}
    ));
  })

  it('returns self when a deep merges is a no-op', () => {
    var m1 = fromJS({a:{b:{c:1,d:2}}});
    expect(
      m1.mergeDeep({a:{b:{c:1}}})
    ).toBe(m1);
  })

  it('returns arg when a deep merges is a no-op', () => {
    var m1 = fromJS({a:{b:{c:1,d:2}}});
    expect(
      Map().mergeDeep(m1)
    ).toBe(m1);
  })

  it('can overwrite existing maps', () => {
    expect(
      fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } })
        .merge({ a: null, b: { x: 10 } })
        .toJS()
    ).toEqual(
      { a: null, b: { x: 10 } }
    );
    expect(
      fromJS({ a: { x: 1, y: 1 }, b: { x: 2, y: 2 } })
        .mergeDeep({ a: null, b: { x: 10 } })
        .toJS()
    ).toEqual(
      { a: null, b: { x: 10, y: 2 } }
    );
  })

  it('can overwrite existing maps with objects', () => {
    var m1 = fromJS({ a: { x: 1, y: 1 } }); // deep conversion.
    var m2 = Map({ a: { z: 10 } }); // shallow conversion to Map.

    // raw object simply replaces map.
    expect(m1.merge(m2).get('a')).toEqual({z: 10}) // raw object.
    expect(m1.mergeDeep(m2).get('a')).toEqual({z: 10}) // raw object.
  })

  it('merges map entries with Vector values', () => {
    expect(
      fromJS({a:[1]}).merge({b:[2]})
    ).is(fromJS(
      {a:[1], b:[2]}
    ));
    expect(
      fromJS({a:[1]}).mergeDeep({b:[2]})
    ).is(fromJS(
      {a:[1], b:[2]}
    ));
  })

  it('maintains JS values inside immutable collections', () => {
    var m1 = fromJS({a:{b:[{imm:'map'}]}});
    var m2 = m1.mergeDeep(
      Map({a: Map({b: List.of( {plain:'obj'} )})})
    );

    expect(m1.getIn(['a', 'b', 0])).is(Map([['imm', 'map']]));
    expect(m2.getIn(['a', 'b', 0])).toEqual({plain: 'obj'});
  })

})
