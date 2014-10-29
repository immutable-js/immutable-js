///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import I = require('immutable');

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

describe('join', () => {

  it('string-joins sequences with commas by default', () => {
    expect(I.Seq.of(1,2,3,4,5).join()).toBe('1,2,3,4,5');
  })

  it('string-joins sequences with any string', () => {
    expect(I.Seq.of(1,2,3,4,5).join('foo')).toBe('1foo2foo3foo4foo5');
  })

  it('string-joins sequences with empty string', () => {
    expect(I.Seq.of(1,2,3,4,5).join('')).toBe('12345');
  })

  it('joins sparse-sequences like Array.join', () => {
    var a = [1,,2,,3,,4,,5,,,];
    expect(I.Seq(a).join()).toBe(a.join());
  })

  check.it('behaves the same as Array.join',
    [gen.array(gen.primitive), gen.primitive], (array, joiner) => {
      expect(I.Seq(array).join(joiner)).toBe(array.join(joiner));
  })

})
