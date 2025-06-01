import { List, Map, MapOf, Record, RecordOf, Set } from 'immutable';
import { expect, pick, test } from 'tstyche';

test('Factory', () => {
  const PointXY = Record({ x: 0, y: 0 });

  expect(PointXY).type.toBe<Record.Factory<{ x: number; y: number }>>();

  expect(PointXY({ x: 'a' })).type.toRaiseError();

  const pointXY = PointXY();

  expect(pointXY).type.toBe<
    Record<{ x: number; y: number }> & Readonly<{ x: number; y: number }>
  >();

  expect(pick(pointXY, 'x')).type.toBe<{ readonly x: number }>();

  expect(pick(pointXY, 'y')).type.toBe<{ readonly y: number }>();

  expect(pointXY.toJS()).type.toBe<{ x: number; y: number }>();

  class PointClass extends PointXY {
    setX(x: number) {
      return this.set('x', x);
    }

    setY(y: number) {
      return this.set('y', y);
    }
  }

  const point = new PointClass();

  expect(point).type.toBe<PointClass>();

  expect(point.x).type.toBe<number>();

  expect(point.y).type.toBe<number>();

  expect(point.setX(10)).type.toBe<PointClass>();

  expect(point.setY(10)).type.toBe<PointClass>();

  expect(point.toJSON()).type.toBe<{ x: number; y: number }>();

  expect(point.toJS()).type.toBe<{ x: number; y: number }>();
});

test('.getDescriptiveName', () => {
  const PointXY = Record({ x: 0, y: 0 });

  expect(Record.getDescriptiveName(PointXY())).type.toBe<string>();

  expect(Record.getDescriptiveName({})).type.toRaiseError();
});

test('Factory', () => {
  const WithMap = Record({
    map: Map({ a: 'A' }),
    list: List(['a']),
    set: Set(['a']),
  });

  const withMap = WithMap();

  expect(withMap.toJSON()).type.toBe<{
    map: MapOf<{ a: string }>;
    list: List<string>;
    set: Set<string>;
  }>();

  // should be `{ map: { a: string; }; list: string[]; set: string[]; }` but there is an issue with circular references
  expect(withMap.toJS()).type.toBe<{
    map: unknown;
    list: unknown;
    set: unknown;
  }>();
});

test('optional properties', () => {
  interface Size {
    distance: string;
  }

  const Line = Record<{ size?: Size; color?: string }>({
    size: undefined,
    color: 'red',
  });

  const line = Line({});

  // should be  { size?: { distance: string; } | undefined; color?: string | undefined; } but there is an issue with circular references
  expect(line.toJS()).type.toBe<{
    size?: unknown;
    color?: string | undefined;
  }>();
});

test('similar properties, but one is optional', () => {
  // see https://github.com/immutable-js/immutable-js/issues/1930

  interface Id {
    value: string;
  }

  expect<RecordOf<{ id?: Id }>>().type.toBeAssignableWith<
    RecordOf<{ id: Id }>
  >();
});
