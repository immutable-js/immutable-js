import { describe, expect, it } from '@jest/globals';
// @ts-expect-error immutable is loaded automatically
import * as Immutable from 'immutable';
import normalizeResult from './normalizeResult';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- import does not work
const installDevTools = require('@immutable/devtools');

installDevTools(Immutable);

// hack to get the formatters from immutable-devtools as they are not exported, but they modify the "global" variable
const immutableFormaters = globalThis.devtoolsFormatters;

const keyStyle = { style: 'color: light-dark( #881391, #D48CE6)' };
const nullStyle = {
  style: 'color: light-dark(rgb(119,119,119), rgb(201, 201, 201))',
};
const numberBooleanStyle = {
  style: 'color: light-dark(rgb(28, 128, 28), rgb(50, 200, 50))',
};
const listStyle = {
  style:
    'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal; position: relative',
};

describe('normalizeResult', () => {
  it('should return the correct primitives', () => {
    expect(normalizeResult(immutableFormaters, undefined)).toEqual([
      'span',
      nullStyle,
      'undefined',
    ]);
    expect(normalizeResult(immutableFormaters, null)).toEqual([
      'span',
      nullStyle,
      'null',
    ]);
    expect(normalizeResult(immutableFormaters, true)).toEqual([
      'span',
      numberBooleanStyle,
      'true',
    ]);
    expect(normalizeResult(immutableFormaters, 0)).toEqual([
      'span',
      numberBooleanStyle,
      '0',
    ]);
    expect(normalizeResult(immutableFormaters, 'a')).toEqual([
      'object',
      { object: 'a' },
    ]);
  });

  it('should return the correct object', () => {
    const result = normalizeResult(immutableFormaters, { a: 1, b: true });

    expect(result).toEqual([
      'span',
      '{ ',
      ['span', keyStyle, 'a: '],
      ['span', numberBooleanStyle, '1'],
      ', ',
      ['span', keyStyle, 'b: '],
      ['span', numberBooleanStyle, 'true'],
      ' }',
    ]);
  });

  it('should return the correct array', () => {
    expect(normalizeResult(immutableFormaters, [])).toEqual(['span', '[]']);

    expect(normalizeResult(immutableFormaters, ['a', null])).toEqual([
      'span',
      '[ ',
      ['object', { object: 'a' }],
      ', ',
      ['span', nullStyle, 'null'],
      ' ]',
    ]);
  });

  it('should return the correct object containing immutable data', () => {
    const result = normalizeResult(immutableFormaters, {
      a: Immutable.List(),
      b: [1],
    });

    expect(result).toEqual([
      'span',
      '{',
      [
        'ol',
        listStyle,
        [
          'li',
          ['span', keyStyle, 'a: '],
          normalizeResult(immutableFormaters, Immutable.List()),
        ],
        [
          'li',
          ['span', keyStyle, 'b: '],
          ['span', '[ ', ['span', numberBooleanStyle, '1'], ' ]'],
        ],
      ],
      '}',
    ]);
  });

  it('should return the correct object for a list containing plain objects', () => {
    const result = normalizeResult(
      immutableFormaters,
      Immutable.List([{ a: 1 }])
    );

    expect(result).toEqual([
      'span',
      expect.anything(),
      [
        'ol',
        listStyle,
        [
          'li',
          ['span', { style: 'color: light-dark( #881391, #D48CE6)' }, '0: '],
          [
            'span',
            '{ ',
            ['span', keyStyle, 'a: '],
            ['span', numberBooleanStyle, '1'],
            ' }',
          ],
        ],
      ],
    ]);
  });

  it('should return the correct object for a list', () => {
    const result = normalizeResult(immutableFormaters, Immutable.List(['a']));

    expect(result).toEqual([
      'span',
      [
        'span',
        [
          'span',
          {
            style:
              'color: light-dark(rgb(232,98,0), rgb(255, 150, 50)); position: relative',
          },
          'List',
        ],
        ['span', '[1]'],
      ],
      [
        'ol',
        {
          style:
            'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal; position: relative',
        },
        [
          'li',
          ['span', { style: 'color: light-dark( #881391, #D48CE6)' }, '0: '],
          ['object', { object: 'a', config: undefined }],
        ],
      ],
    ]);
  });

  it('should return the correct object for an empty list', () => {
    const result = normalizeResult(immutableFormaters, Immutable.List());
    expect(result).toEqual([
      'span',
      [
        'span',
        [
          'span',
          {
            style:
              'color: light-dark(rgb(232,98,0), rgb(255, 150, 50)); position: relative',
          },
          'List',
        ],
        ['span', '[0]'],
      ],
    ]);
  });

  it('should return the correct object for a deep list', () => {
    const result = normalizeResult(
      immutableFormaters,
      Immutable.List([Immutable.List(['a'])])
    );

    expect(result).toEqual([
      'span',
      [
        'span',
        [
          'span',
          {
            style:
              'color: light-dark(rgb(232,98,0), rgb(255, 150, 50)); position: relative',
          },
          'List',
        ],
        ['span', '[1]'],
      ],
      [
        'ol',
        {
          style:
            'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal; position: relative',
        },
        [
          'li',
          ['span', { style: 'color: light-dark( #881391, #D48CE6)' }, '0: '],
          [
            'span',
            [
              'span',
              [
                'span',
                {
                  style:
                    'color: light-dark(rgb(232,98,0), rgb(255, 150, 50)); position: relative',
                },
                'List',
              ],
              ['span', '[1]'],
            ],
            [
              'ol',
              {
                style:
                  'list-style-type: none; padding: 0; margin: 0 0 0 12px; font-style: normal; position: relative',
              },
              [
                'li',
                [
                  'span',
                  { style: 'color: light-dark( #881391, #D48CE6)' },
                  '0: ',
                ],
                ['object', { object: 'a', config: undefined }],
              ],
            ],
          ],
        ],
      ],
    ]);
  });
});
