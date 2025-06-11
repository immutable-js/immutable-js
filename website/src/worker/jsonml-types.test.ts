import { describe, expect, it } from '@jest/globals';
import { Element, explodeElement } from './jsonml-types';

describe('explodeElement', () => {
  it('should explode an element', () => {
    expect(explodeElement(['div'])).toEqual({
      tagName: 'div',
      attributes: undefined,
      children: [],
    });
  });

  it('should explode an element with attributes', () => {
    expect(explodeElement(['div', { id: 'test' }])).toEqual({
      tagName: 'div',
      attributes: { id: 'test' },
      children: [],
    });
  });

  it('should explode an element with children', () => {
    expect(explodeElement(['div', { id: 'test' }, 'Hello'])).toEqual({
      tagName: 'div',
      attributes: { id: 'test' },
      children: ['Hello'],
    });
  });

  it('should explode an element with multiple children', () => {
    expect(explodeElement(['div', { id: 'test' }, 'Hello', 'World'])).toEqual({
      tagName: 'div',
      attributes: { id: 'test' },
      children: ['Hello', 'World'],
    });
  });

  it('should explode an element without attributes with multiple children', () => {
    expect(explodeElement(['div', 'Hello', 'World'])).toEqual({
      tagName: 'div',
      attributes: undefined,
      children: ['Hello', 'World'],
    });
  });

  it('should explode an element with a nested element', () => {
    expect(explodeElement(['div', { id: 'test' }, ['span', 'Hello']])).toEqual({
      tagName: 'div',
      attributes: { id: 'test' },
      children: [['span', 'Hello']],
    });
  });

  it('should explode an element with a nested element with attributes', () => {
    expect(
      explodeElement([
        'div',
        { id: 'test' },
        ['span', { class: 'test' }, 'Hello'],
      ])
    ).toEqual({
      tagName: 'div',
      attributes: { id: 'test' },
      children: [['span', { class: 'test' }, 'Hello']],
    });
  });

  it('should explode an element with a nested element with multiple children', () => {
    expect(
      explodeElement([
        'div',
        { id: 'test' },
        ['span', 'Hello'],
        ['span', { id: 'world' }, 'World'],
      ])
    ).toEqual({
      tagName: 'div',
      attributes: { id: 'test' },
      children: [
        ['span', 'Hello'],
        ['span', { id: 'world' }, 'World'],
      ],
    });
  });

  it('should handle immutable list jsonml', () => {
    const spanElement: Element = [
      'span',
      { style: 'color: light-dark( #881391, #D48CE6)' },
      '0: ',
    ];
    const objectElement: Element = ['object', { object: ['a'] }];

    const element: Element = ['li', spanElement, objectElement];

    expect(explodeElement(element)).toEqual({
      tagName: 'li',
      attributes: undefined,
      children: [
        ['span', { style: 'color: light-dark( #881391, #D48CE6)' }, '0: '],
        ['object', { object: ['a'] }],
      ],
    });
  });
});
