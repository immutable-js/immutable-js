/* global document */
const { List, isPlainObject } = require('../src/Immutable');

describe('Utils', () => {
  describe('isPlainObj()', function testFunc() {
    const nonPlainCases = [
      ['Host object', document.createElement('div')],
      ['bool primitive false', false],
      ['bool primitive true', true],
      ['falsy undefined', undefined],
      ['falsy null', null],
      ['Simple function', function () {}],
      [
        'Instance of other object',
        (function () {
          function Foo() {}
          return new Foo();
        })(),
      ],
      ['Number primitive ', 5],
      ['String primitive ', 'P'],
      ['Number Object', Number(6)],
      ['Immutable.List', new List()],
      ['simple array', ['one']],
      ['Error', Error],
      ['Internal namespaces', Math],
      ['Arguments', arguments],
    ];
    const plainCases = [
      ['literal Object', {}],
      ['new Object', new Object()], // eslint-disable-line no-new-object
      ['Object.create(null)', Object.create(null)],
      ['nested object', { one: { prop: 'two' } }],
      ['constructor prop', { constructor: 'prop' }], // shadows an object's constructor
      ['constructor.name', { constructor: { name: 'two' } }], // shadows an object's constructor.name
      [
        'Fake toString',
        {
          toString: function () {
            return '[object Object]';
          },
        },
      ],
    ];

    nonPlainCases.forEach(([name, value]) => {
      it(`${name} returns false`, () => {
        expect(isPlainObject(value)).toBe(false);
      });
    });

    plainCases.forEach(([name, value]) => {
      it(`${name} returns true`, () => {
        expect(isPlainObject(value)).toBe(true);
      });
    });
  });
});
