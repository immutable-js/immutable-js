jest.autoMockOff();

var Immutable = require('immutable');
var Record = Immutable.Record;

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

  it('short-circuits if already a record', () => {
    var Point = Record({x: 0, y: 0});
    var a = new Point({x: 1, y: 2});

    expect(a === Point(a));
    expect(a === new Point(a));

    var OtherPoint = Record({x: 0, y: 0});

    expect(a !== OtherPoint(a));
    expect(OtherPoint(a).equals(a));
  });

  it('can construct sub-records', () => {
    var Field = Immutable.Record({
      value: '', isFocused: false
    });

    var Login = Immutable.Record({
      user: Field(),
      password: Field()
    });

    var l1 = Login();

    expect(l1.user instanceof Field);
    expect(l1.password instanceof Field);
    expect(l1.user.value === '');
    expect(l1.user.isFocused === false);
    expect(l1.password.value === '');
    expect(l1.password.isFocused === false);

    expect(l1.equals(new Login()))

    var l2 = Login({user: {value: 'gozala'}})

    expect(l2.user instanceof Field);
    expect(l2.password instanceof Field);
    expect(l2.user.value === 'gozala');
    expect(l2.user.isFocused === false);
    expect(l2.password.value === '');
    expect(l2.password.isFocused === false);

    var l3 = Login({user: {value: 'gozala'},
                    password: {isFocused: true},
                    extra: {isFocused: false}});

    expect(l3.user instanceof Field);
    expect(l3.password instanceof Field);
    expect(l3.user.value === 'gozala');
    expect(l3.user.isFocused === false);
    expect(l3.password.value === '');
    expect(l3.password.isFocused === true);
    expect(l2.extra === undefined);
  });

  it('can update sub-records', () => {
    var Field = Immutable.Record({
      value: '', isFocused: false
    });

    var Login = Immutable.Record({
      user: Field(),
      password: Field()
    });

    var l1 = Login();
    expect(l1.user instanceof Field);
    expect(l1.password instanceof Field);
    expect(l1.user.value === '');
    expect(l1.user.isFocused === false);
    expect(l1.password.value === '');
    expect(l1.password.isFocused === false);

    var l2 = l1.set('user', {value: 'gozala'})
    expect(l2.user instanceof Field);
    expect(l2.password instanceof Field);
    expect(l2.user.value === 'gozala');
    expect(l2.user.isFocused === false);
    expect(l2.password.value === '');
    expect(l2.password.isFocused === false);

    var l3 = l1.updateIn(['user'], _ => ({value: 'updateIn'}));
    expect(l3.user instanceof Field);
    expect(l3.password instanceof Field);
    expect(l3.user.value === 'updateIn');
    expect(l3.user.isFocused === false);
    expect(l3.password.value === '');
    expect(l3.password.isFocused === false);

    var l4 = l2.set('user', null);
    expect(l4.user instanceof Field);
    expect(l4.password instanceof Field);
    expect(l4.user.value === '');
    expect(l4.user.isFocused === false);
    expect(l4.password.value === '');
    expect(l4.password.isFocused === false);

    var l5 = l1.merge({user: {value: 'merge'}});
    expect(l5.user instanceof Field);
    expect(l5.password instanceof Field);
    expect(l5.user.value === 'merge');
    expect(l5.user.isFocused === false);
    expect(l5.password.value === '');
    expect(l5.password.isFocused === false);

  });
});
