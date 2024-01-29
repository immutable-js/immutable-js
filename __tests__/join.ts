import { Seq } from 'immutable';
import * as jasmineCheck from 'jasmine-check';

jasmineCheck.install();

describe('join', () => {
  it('string-joins sequences with commas by default', () => {
    expect(Seq([1, 2, 3, 4, 5]).join()).toBe('1,2,3,4,5');
  });

  it('string-joins sequences with any string', () => {
    expect(Seq([1, 2, 3, 4, 5]).join('foo')).toBe('1foo2foo3foo4foo5');
  });

  it('string-joins sequences with empty string', () => {
    expect(Seq([1, 2, 3, 4, 5]).join('')).toBe('12345');
  });

  it('joins sparse-sequences like Array.join', () => {
    const a = [
      1,
      undefined,
      2,
      undefined,
      3,
      undefined,
      4,
      undefined,
      5,
      undefined,
      undefined,
    ];
    expect(Seq(a).join()).toBe(a.join());
  });

  check.it(
    'behaves the same as Array.join',
    [gen.array(gen.primitive), gen.primitive],
    (array, joiner) => {
      expect(Seq(array).join(joiner)).toBe(array.join(joiner));
    }
  );
});
