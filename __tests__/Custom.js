jest.autoMockOff();

var Immutable = require('immutable');
var Map = Immutable.Map;
var List = Immutable.List;

class Person extends Map {
  constructor(value) {
    return super(value);
  }
  fullName() {
    if (this.has('firstName') && this.has('lastName')) {
      return this.get('firstName') + ' ' + this.get('lastName');
    }
    return 'N/A';
  }
}

describe('Custom List, Map, Set, Stack', () => {

  it('map can be subclassed', () => {
    var p = new Person({'firstName':'Joe', 'lastName':'Smith'});
    var p2 = p.set('firstName', 'Jane');
    expect(p instanceof Person);
    expect(p.size).toBe(2);
    expect(p.fullName()).toBe('Joe Smith');
    expect(p2.fullName()).toBe('Jane Smith');
    var p3 = p2.clear();
    expect(p3 instanceof Person);
    expect(p3.size).toBe(0);
    expect(p3.fullName()).toBe('N/A');
  });

  it('list can be subclassed', () => {
    class People extends List {
      constructor(value) {
        return super(value);
      }
      set(key, val) {
        val = val instanceof Person ? val : new Person(val);
        return super(key, val)
      }
    }
    var ppl = new People([new Person({firstName: 'Tim', lastName: 'G'})]);
    expect(ppl instanceof People);
    expect(ppl.size).toBe(1);
    expect(ppl.get(0) instanceof Person);
    var newPpl = ppl.updateIn([0], (person) => {
      return person.set('firstName', 'Bob');
    });
    expect(ppl.get(0).fullName()).toBe('Tim G');
    expect(newPpl.get(0).fullName()).toBe('Bob G');
    var pushed = newPpl.push(Immutable.Map({firstName: 'Test', lastName: 'User'}));
    expect(pushed.last() instanceof Person);
  });


});
