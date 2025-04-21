/**
 * TypeScript types representing a JsonML grammar
 *
 * This represents a JSON-based markup language where elements are represented as arrays:
 * - First element is the tag name
 * - Second element (optional) is an attributes object
 * - Remaining elements are children
 */

// Basic types
type TagName = string;
type AttributeName = string;
type AttributeValue = string | number | boolean | null;

// Attributes
// type Attribute = [AttributeName, AttributeValue];
// type AttributeList = Attribute[];
export type Attributes = Record<AttributeName, AttributeValue>;

// Elements
export type Element =
  | [TagName, Attributes, ...Element[]] // [tag-name, attributes, element-list]
  | [TagName, Attributes] // [tag-name, attributes]
  | [TagName, ...Element[]] // [tag-name, element-list]
  | [TagName] // [tag-name]
  | string; // string

// Element list is just a list of elements
export type JsonMLElementList = Element[];
