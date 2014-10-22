///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');

describe('Sequence', () => {

  it('can be empty', () => {
    expect(Immutable.Sequence().size).toBe(0);
  });

  it('accepts an array', () => {
    expect(Immutable.Sequence([1,2,3]).size).toBe(3);
  });

  it('accepts an object', () => {
    expect(Immutable.Sequence({a:1,b:2,c:3}).size).toBe(3);
  });

  it('accepts a scalar', () => {
    expect(Immutable.Sequence('foo').size).toBe(1);
  });

  it('accepts a class', () => {
    function Foo() {
      this.bar = 'bar';
      this.baz = 'baz';
    }
    expect(Immutable.Sequence(new Foo()).size).toBe(1);
  });

  it('empty returns an empty Sequence.', () => {
    var e1 = Immutable.Sequence.empty();
    var e2 = Immutable.Sequence.empty();
    expect(e1.size).toBe(0);
    expect(e1).toBe(e2);
  });

  it('of accepts varargs', () => {
    expect(Immutable.Sequence.of(1,2,3).size).toBe(3);
  });

  it('from accepts another sequence', () => {
    var seq = Immutable.Sequence.of(1,2,3);
    expect(Immutable.Sequence.from(seq).size).toBe(3);
  });

  it('temporarily warns about sequence length', function () {
    this.spyOn(console, 'warn');

    var seq = Immutable.Sequence.of(1,2,3);

    // Note: `length` has been removed from the type definitions.
    var length = (<any>seq).length;

    expect((<any>console).warn.mostRecentCall.args[0]).toContain(
      'sequence.length has been deprecated, '+
      'use sequence.size or sequence.count(). '+
      'This warning will become a silent error in a future version.'
    );

    expect(length).toBe(3);
  });


});
