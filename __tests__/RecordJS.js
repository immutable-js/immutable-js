jest.autoMockOff();

var Immutable = require('immutable');
var Record = Immutable.Record;
var sinon = require('sinon');
var spy = sinon.spy;

describe('Record', () => {

  it('defines a constructor', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t = new MyType();
    var t2 = t.set('a', 10);

    expect(t.a).toBe(1);
    expect(t2.a).toBe(10);
  });

  it('can have mutations apply', () => {
    var MyType = Record({a:1, b:2, c:3});

    var t = new MyType();

    expect(() => { t.a = 10; }).toThrow();

    var t2 = t.withMutations(mt => {
      mt.a = 10;
      mt.b = 20;
      mt.c = 30;
    });

    expect(t.a).toBe(1);
    expect(t2.a).toBe(10);
  });

  it('can be subclassed', () => {

    class Alphabet extends Record({a:1, b:2, c:3}) {
      soup() {
        return this.a + this.b + this.c;
      }
    }

    var t = new Alphabet();
    var t2 = t.set('b', 200);

    expect(t instanceof Record);
    expect(t instanceof Alphabet);
    expect(t.soup()).toBe(6);
    expect(t2.soup()).toBe(204);
  });

  it('can be cleared', () => {
    var MyType = Record({a:1, b:2, c:3});
    var t = new MyType({c:'cats'});

    expect(t.c).toBe('cats');
    t = t.clear();
    expect(t.c).toBe(3);

    var MyType2 = Record({d:4, e:5, f:6});
    var t2 = new MyType2({d:'dogs'});

    expect(t2.d).toBe('dogs');
    t2 = t2.clear();
    expect(t2.d).toBe(4);
  });

  it('should warn when using map/filter/reduce', () => {

    // Temporarily overwrite console.warn to avoid logging during tests
    var _warn = console.warn;
    console.warn = () => {};
    
    var MyType = Record({a:1, b:2, c:3});
    var t = new MyType({c:'cats'});

    var mapFunctionSpy = spy();
    var warnSpy = spy(console, 'warn');

    t.map(mapFunctionSpy);
    expect(mapFunctionSpy.firstCall.args[0]).toBe(1);
    expect(mapFunctionSpy.secondCall.args[0]).toBe(2);
    expect(mapFunctionSpy.thirdCall.args[0]).toBe('cats');

    expect(warnSpy.called).toBe(true);

    console.warn = _warn;
  });
});
