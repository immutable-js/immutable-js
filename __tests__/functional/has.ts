import { has, Map, List, Range } from 'immutable';

describe('has', () => {
  it('for immutable structure', () => {
    expect(has(Range(0, 100), 20)).toBe(true);
    expect(has(List(['dog', 'frog', 'cat']), 1)).toBe(true);
    expect(has(List(['dog', 'frog', 'cat']), 20)).toBe(false);

    expect(has(Map({ x: 123, y: 456 }), 'x')).toBe(true);
  });
  it('for Array', () => {
    expect(has(['dog', 'frog', 'cat'], 1)).toBe(true);
    expect(has(['dog', 'frog', 'cat'], 20)).toBe(false);
  });

  it('for plain objects', () => {
    expect(has({ x: 123, y: 456 }, 'x')).toBe(true);
    expect(has({ x: 123, y: 456 }, 'z')).toBe(false);
  });

  // sould be true, but does not work
  //   it('for class objects', () => {
  //     class Dog {
  //       name: string;

  //       constructor(name: string) {
  //         this.name = name;
  //       }
  //     }

  //     const dog = new Dog('Rex');

  //     expect(has(dog, 'name')).toBe(true);
  //     expect(has(dog, 'color')).toBe(false);
  //   });
});
