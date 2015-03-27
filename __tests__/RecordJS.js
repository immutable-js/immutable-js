jest.autoMockOff();

var Immutable = require('immutable');
var Record = Immutable.Record;
var Nullable = Immutable.Nullable;

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

  it('can have nullable fields', () => {
    var A = Record({ x: 0 });
    var B = Record({ a: Nullable(A) });
    expect(B().toJS()).toEqual({ a: null });
    expect(B({}).toJS()).toEqual({ a: null });
    expect(B({a:{}}).toJS()).toEqual({ a: { x: 0 } });
    expect(B({a:{x: 10}}).toJS()).toEqual({ a: { x: 10 } });
  });

  it('can have self-referential fields', () => {
    var Node = Record(() => ({ next: Nullable(Node) }));
    expect(Node().toJS()).toEqual({ next: null });
    expect(Node({}).toJS()).toEqual({ next: null });
    expect(Node({next:{}}).toJS()).toEqual({ next: { next: null }});
  });

  it('can describe an infinite type', () => {
    var Node = Record(() => ({ next: Node }));
    // danger! calling toJS, toString, or reifying this in any way will cause
    // a stack overflow!
    var node = Node();
    expect(node.get('next') instanceof Node).toBe(true);
    expect(node.get('next').get('next') instanceof Node).toBe(true);
    expect(node.getIn(['next', 'next', 'next', 'next']) instanceof Node).toBe(true);
  });

  it('can construct sub-records', () => {
    var Field = Record({
      value: '',
      isFocused: false
    });

    var Login = Record({
      user: Field,
      password: Field
    });

    var l1 = Login();
    expect(l1.equals(new Login())).toBe(true);
    expect(l1.user instanceof Field).toBe(true);
    expect(l1.password instanceof Field).toBe(true);
    expect(l1.user.value).toBe('');
    expect(l1.user.isFocused).toBe(false);
    expect(l1.password.value).toBe('');
    expect(l1.password.isFocused).toBe(false);

    var l2 = Login({ user: { value: 'create' }})
    expect(l2.equals(new Login({user: {value: 'create'}}))).toBe(true);
    expect(l2.user instanceof Field).toBe(true);
    expect(l2.password instanceof Field).toBe(true);
    expect(l2.user.value).toBe('create');
    expect(l2.user.isFocused).toBe(false);
    expect(l2.password.value).toBe('');
    expect(l2.password.isFocused).toBe(false);

    var l3 = Login({
      user: { value: 'create' },
      password: { isFocused: true },
      extra: { isFocused: false }
    });
    expect(l3.user instanceof Field).toBe(true);
    expect(l3.password instanceof Field).toBe(true);
    expect(l3.user.value).toBe('create');
    expect(l3.user.isFocused).toBe(false);
    expect(l3.password.value).toBe('');
    expect(l3.password.isFocused).toBe(true);
    expect(l2.extra).toBe(undefined);
  });

  it('can update sub-records', () => {
    var Field = Record({
      value: String,
      isFocused: Boolean
    });

    var Login = Record({
      user: Field,
      password: Field
    });

    var l1 = Login();
    expect(l1.user.value).toBe('');

    var l2 = l1.set('user', {value: 'set'})
    expect(l2.user instanceof Field).toBe(true);
    expect(l2.user.value).toBe('set');

    var l3 = l1.updateIn(['user'], () => ({value: 'updateIn'}));
    expect(l3.user instanceof Field).toBe(true);
    expect(l3.user.value).toBe('updateIn');

    var l4 = l2.set('user', null);
    expect(l4.user instanceof Field).toBe(true);
    expect(l4.user.value).toBe('');

    var l5 = l1.merge({user: {value: 'merge'}});
    expect(l5.user instanceof Field).toBe(true);
    expect(l5.user.value).toBe('merge');
  });
});
