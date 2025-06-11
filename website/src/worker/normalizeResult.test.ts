// @ts-expect-error immutable is loaded automatically
import * as Immutable from 'immutable';
import { describe, expect, it } from '@jest/globals';
import normalizeResult from './normalizeResult';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- import does not work
const installDevTools = require('@jdeniau/immutable-devtools');

installDevTools(Immutable);

// hack to get the formatters from immutable-devtools as they are not exported, but they modify the "global" variable
const immutableFormaters = globalThis.devtoolsFormatters;

describe('normalizeResult', () => {
  it('should return the correct object', () => {
    const result = normalizeResult(immutableFormaters, { a: 1, b: 2 });

    expect(result).toEqual(JSON.stringify({ a: 1, b: 2 }));
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
