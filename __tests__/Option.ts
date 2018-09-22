///<reference path='../resources/jest.d.ts'/>

declare var Symbol: any;
import { None, Option, Set, Some } from '../';

describe('Option', function() {
  it('should return a None if null is given on instantiation', () => {
    const result = Option(null);
    expect(result instanceof None).toEqual(true);
  });

  it('should return a None if no value is given on instantiation', () => {
    const result = Option(undefined);
    expect(result instanceof None).toEqual(true);
  });

  it('should return a Some if any other type is passed on instantiation', () => {
    const instanceTypes = [2, 'string', 0, false, true, '', [], {}, Set([1, 2, 3, 4])];
    instanceTypes.forEach(_ => {
      const result = Option(_);
      expect(result instanceof Some).toEqual(true);
    });
  });


});
