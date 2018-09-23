///<reference path='../resources/jest.d.ts'/>

declare var Symbol: any;
import { List, None, Option, Set, Some } from '../';

describe('Option', function() {
  describe('instantiation', () => {
    it('should return a None if null is given on instantiation', () => {
      const result = Option(null);
      expect(result instanceof None).toEqual(true);
    });

    it('should return a None if no value is given on instantiation', () => {
      const result = Option(undefined);
      expect(result instanceof None).toEqual(true);
    });

    it('should return a Some if any other type is passed on instantiation', () => {
      const instanceTypes = [
        2,
        'string',
        0,
        false,
        true,
        '',
        [],
        {},
        Set([1, 2, 3, 4]),
      ];
      instanceTypes.forEach(_ => {
        const result = Option(_);
        expect(result instanceof Some).toEqual(true);
      });
    });
  });

  describe('Some', () => {
    it('should return a None if null is given on instantiation', () => {
      const result = Option(null);
      expect(result instanceof None).toEqual(true);
    });

    it('should return a None if no value is given on instantiation', () => {
      const result = Option(undefined);
      expect(result instanceof None).toEqual(true);
    });

    it('should return a Some if any other type is passed on instantiation', () => {
      const instanceTypes = [
        2,
        'string',
        0,
        false,
        true,
        '',
        [],
        {},
        Set([1, 2, 3, 4]),
      ];
      instanceTypes.forEach(_ => {
        const result = Option(_);
        expect(result instanceof Some).toEqual(true);
      });
    });

    it('should be instantiatable without new', () => {
      const result = Some(55);
      expect(result instanceof Some).toEqual(true);
    });

    describe('map', () => {
      let instance;

      beforeEach(() => {
        instance = Some(56);
      });

      it('should apply the passed predicate to the value and return a new instance of Some', () => {
        const result = instance.map(_ => 2 * _);

        expect(result instanceof Some).toEqual(true);
        expect(result).not.toBe(instance);
      });

      it('should throw an exceptioni if no parameter is passed', () => {
        const testFct = () => {
          const result = instance.map();
        };
        expect(testFct).toThrow();
      });

      it('should throw an exception if a parameter other than a function is passed', () => {
        const testFct = () => {
          const result = instance.map(45);
        };
        expect(testFct).toThrow();
      });

      it('should return a None if the predicate returns null', () => {
        const result = instance.map(() => null);
        expect(result instanceof None).toEqual(true);
      });

      it('should return a None if a predicate returns NaN', () => {
        const result = instance.map(() => parseInt('a string', 10));
        expect(result instanceof None).toEqual(true);
      });

      it('should not return None if result is a valid number', () => {
        const test = Some('');
        expect(test.map(x => x.length)).toEqual(Some(0));
      });

      it('should accept a List as parameter', () => {
        const stringInstance = Some('a splittable string');
        const modifier = x => List(x.split(' '));

        expect(stringInstance.map(modifier)).toEqual(
          Some(List.of('a', 'splittable', 'string'))
        );
      });

      it('should not automatically flatten is the result of map is another Some', () => {
        const result = instance.map(_ => Some(1 / _));
        expect(result).toEqual(Some(Some(1 / 56)));
      });

      it('should not automatically flatten is the result of map is a None', () => {
        const result = instance.map(_ => None());
        expect(result).toEqual(Some(None()));
      });

      it('should return a result that can be flattened', () => {
        const result = instance.map(_ => Some(1 / _));
        const expectation = Some(1 / 56);
        expect(result.flatten(true)).toEqual(expectation);
      });

      it('should flatten several levels deep', () => {
        const test = Some(Some(Some(Some('test'))));
        expect(test.flatten(false)).toEqual(Some('test'));
      });

      it('should throw an exception if trying to flatten a list in an option', () => {
        const test = Some(List([1, 2, 3]));
        const testFct = function() {
          test.flatten(true);
        };

        expect(testFct).toThrow();
      });
    });

    describe('flatMap', () => {
      it('should flatten nested Options', () => {
        const test = Some('test');
        const modifier = x => Some(x + x);

        expect(test.flatMap(modifier)).toEqual(Some('testtest'));
      });

      it('should return a None if the passed function returns a None', () => {
        const test = Some('test');
        const modifier = x => None();

        expect(test.flatMap(modifier)).toEqual(None());
      });

      it('should throw an exception when trying to flatten a collection in a Some', () => {
        const nextInstance = Some(45);
        const modifier = x => List([2 * x, x / 2]);
        const testFct = () => {
          nextInstance.flatMap(modifier);
        };

        expect(testFct).toThrow();
      });
    });

    describe('getOrElse', () => {
      it('should return the value in the instance', () => {
        const otherInstance = Some('a longer string');
        expect(otherInstance.getOrElse('alternative')).toEqual(
          'a longer string'
        );
      });
    });

    describe('filter', () => {
      it('should return a similar Some if the filter predicate returns true', () => {
        const otherInstance = Some(56);
        const predicate = x => true;

        const res = otherInstance.filter(predicate);
        expect(res).toEqual(otherInstance);
        expect(res).not.toBe(otherInstance);
      });

      it('should return a None if the filter predicate returns false', () => {
        const otherInstance = Some(56);
        const predicate = x => false;

        expect(otherInstance.filter(predicate)).toEqual(None());
      });
    });
  });

  describe('None', () => {
    let instance;

    beforeEach(() => {
      instance = new None();
    });

    it('should be instantiated by function without new', () => {
      const result = None();
      expect(result).toEqual(instance);
      expect(result instanceof None).toEqual(true);
    });

    it('should return itself on a call to map', () => {
      expect(instance.map(x => x * 2)).toBe(instance);
    });

    it('should return itself on a call to flatMap', () => {
      expect(instance.flatMap(x => x * 2)).toBe(instance);
    });

    it('should return itself on a call to flatten', () => {
      expect(instance.flatten(false)).toBe(instance);
    });

    it('should return the Else value for getOrElse()', () => {
      expect(instance.getOrElse('alternative')).toEqual('alternative');
    });

    it('should return a new instance of None if the predicate to filter returns true', () => {
      const predicate = x => true;
      const result = instance.filter(predicate);

      expect(result).toEqual(instance);
      expect(result).not.toBe(instance);
    });

    it('should return a new instance of None if the predicate to filter returns false', () => {
      const predicate = x => false;
      const result = instance.filter(predicate);

      expect(result).not.toBe(instance);
    });
  });

  describe('List interop', () => {
    it('should remove None from a flatMap', () => {
      const initialList = List([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const newList = initialList.flatMap(
        _ => (_ % 2 === 0 ? Some(2 * _) : None())
      );

      expect(newList.toArray()).toEqual([4, 8, 12, 16]);
    });

    it('should keep the Options on a map', () => {
      const initialList = List([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const newList = initialList.map(
        _ => (_ % 2 === 0 ? Some(2 * _) : None())
      );

      expect(newList.toArray().slice(0, 2)).toEqual([None(), Some(4)]);
    });

    it('should not break a list with None and Some', () => {
      const initialList = List([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const newList = initialList
        .map(_ => (_ % 2 === 0 ? Some(2 * _) : None()))
        .map(_ => _.map(x => 1 / x));

      expect(newList).toEqual(
        List.of(
          None(),
          Some(0.25),
          None(),
          Some(0.125),
          None(),
          Some(1 / 12),
          None(),
          Some(1 / 16),
          None()
        )
      );
    });

    it('should be able to create a flattenable list', () => {
      const initialList = List([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const newList = initialList
        .map(_ => (_ % 2 === 0 ? Some(2 * _) : None()))
        .map(_ => _.map(x => 1 / x))
        .flatten(true);

      expect(newList).toEqual(List.of(0.25, 0.125, 1 / 12, 0.0625));
    });
  });
});
