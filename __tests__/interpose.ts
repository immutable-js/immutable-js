///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');

describe('interpose', () => {

  it('separates with a value', () => {
    var range = I.Range(10, 15);
    var interposed = range.interpose(0);
    expect(interposed.toArray()).toEqual(
      [ 10, 0, 11, 0, 12, 0, 13, 0, 14 ]
    );
  })

  it('can be iterated', () => {
    var range = I.Range(10, 15);
    var interposed = range.interpose(0);
    var values = interposed.values();
    expect(values.next()).toEqual({ value: 10, done: false });
    expect(values.next()).toEqual({ value: 0, done: false });
    expect(values.next()).toEqual({ value: 11, done: false });
    expect(values.next()).toEqual({ value: 0, done: false });
    expect(values.next()).toEqual({ value: 12, done: false });
    expect(values.next()).toEqual({ value: 0, done: false });
    expect(values.next()).toEqual({ value: 13, done: false });
    expect(values.next()).toEqual({ value: 0, done: false });
    expect(values.next()).toEqual({ value: 14, done: false });
    expect(values.next()).toEqual({ value: undefined, done: true });
  })

})
