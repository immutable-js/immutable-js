///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import I = require('../dist/Immutable');

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

  it('merges two maps with a merge function', () => {
    var m1 = I.Map({a:1,b:2,c:3});
    var m2 = I.Map({d:10,b:20,e:30});
    expect(m1.mergeWith((a, b) => a + b, m2)).is(I.Map({a:1,b:22,c:3,d:10,e:30}));
  })

  it('deep merges two maps', () => {
    var m1 = I.fromJSON({a:{b:{c:1,d:2}}});
    var m2 = I.fromJSON({a:{b:{c:10,e:20},f:30},g:40});
    expect(m1.mergeDeep(m2)).is(I.fromJSON({a:{b:{c:10,d:2,e:20},f:30},g:40}));
  })

  it('deep merges raw JS', () => {
    var m1 = I.fromJSON({a:{b:{c:1,d:2}}});
    var js = {a:{b:{c:10,e:20},f:30},g:40};
    expect(m1.mergeDeep(js)).is(I.fromJSON({a:{b:{c:10,d:2,e:20},f:30},g:40}));
  })

  it('deep merges raw JS with a merge function', () => {
    var m1 = I.fromJSON({a:{b:{c:1,d:2}}});
    var js = {a:{b:{c:10,e:20},f:30},g:40};
    expect(
      m1.mergeDeepWith((a, b) => a + b, js)
    ).is(I.fromJSON(
      {a:{b:{c:11,d:2,e:20},f:30},g:40}
    ));
  })

})
