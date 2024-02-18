import { expectType, expectError } from 'tsd';
import { List, Map, MapOf, Record, RecordOf, Set } from 'immutable';

{
  // Factory
  const PointXY = Record({ x: 0, y: 0 });

  expectType<Record.Factory<{ x: number; y: number }>>(PointXY);

  expectError(PointXY({ x: 'a' }));

  const pointXY = PointXY();

  expectType<
    Record<{ x: number; y: number }> & Readonly<{ x: number; y: number }>
  >(pointXY);

  expectType<number>(pointXY.x);

  expectError((pointXY.x = 10));

  expectType<number>(pointXY.y);

  expectError((pointXY.y = 10));

  expectType<{ x: number; y: number }>(pointXY.toJS());

  class PointClass extends PointXY {
    setX(x: number) {
      return this.set('x', x);
    }

    setY(y: number) {
      return this.set('y', y);
    }
  }

  const point = new PointClass();

  expectType<PointClass>(point);

  expectType<number>(point.x);

  expectType<number>(point.y);

  expectType<PointClass>(point.setX(10));

  expectType<PointClass>(point.setY(10));

  expectType<{ x: number; y: number }>(point.toJSON());

  expectType<{ x: number; y: number }>(point.toJS());
}

{
  // .getDescriptiveName
  const PointXY = Record({ x: 0, y: 0 });

  expectType<string>(Record.getDescriptiveName(PointXY()));

  expectError(Record.getDescriptiveName({}));
}

{
  // Factory
  const WithMap = Record({
    map: Map({ a: 'A' }),
    list: List(['a']),
    set: Set(['a']),
  });

  const withMap = WithMap();

  expectType<{
    map: MapOf<{ a: string }>;
    list: List<string>;
    set: Set<string>;
  }>(withMap.toJSON());

  // should be `{ map: { a: string; }; list: string[]; set: string[]; }` but there is an issue with circular references
  expectType<{ map: unknown; list: unknown; set: unknown }>(withMap.toJS());
}

{
  // optional properties

  interface Size {
    distance: string;
  }

  const Line = Record<{ size?: Size; color?: string }>({
    size: undefined,
    color: 'red',
  });

  const line = Line({});

  // should be  { size?: { distance: string; } | undefined; color?: string | undefined; } but there is an issue with circular references
  expectType<{ size?: unknown; color?: string | undefined }>(line.toJS());
}

{
  // similar properties, but one is optional. See https://github.com/immutable-js/immutable-js/issues/1930

  interface Id {
    value: string;
  }

  type A = RecordOf<{ id: Id }>;
  type B = RecordOf<{ id?: Id }>;

  const a: A = null as any;
  const b: B = a;
}
