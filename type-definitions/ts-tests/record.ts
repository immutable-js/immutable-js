import { List, Map, Record, RecordOf, Set } from 'immutable';

{
  // Factory
  const PointXY = Record({ x: 0, y: 0 });

  // $ExpectType Factory<{ x: number; y: number; }>
  PointXY;

  // $ExpectError
  PointXY({ x: 'a' });

  const pointXY = PointXY();

  // $ExpectType Record<{ x: number; y: number; }> & Readonly<{ x: number; y: number; }>
  pointXY;

  // $ExpectType number
  pointXY.x;

  // $ExpectError
  pointXY.x = 10;

  // $ExpectType number
  pointXY.y;

  // $ExpectError
  pointXY.y = 10;

  // $ExpectType { x: number; y: number; }
  pointXY.toJS();

  class PointClass extends PointXY {
    setX(x: number) {
      return this.set('x', x);
    }

    setY(y: number) {
      return this.set('y', y);
    }
  }

  const point = new PointClass();

  // $ExpectType PointClass
  point;

  // $ExpectType number
  point.x;

  // $ExpectType number
  point.y;

  // $ExpectType PointClass
  point.setX(10);

  // $ExpectType PointClass
  point.setY(10);

  // $ExpectType { x: number; y: number; }
  point.toJSON();

  // $ExpectType { x: number; y: number; }
  point.toJS();
}

{
  // .getDescriptiveName
  const PointXY = Record({ x: 0, y: 0 });

  // $ExpectType string
  Record.getDescriptiveName(PointXY());

  // $ExpectError
  Record.getDescriptiveName({});
}

{
  // Factory
  const WithMap = Record({
    map: Map({ a: 'A' }),
    list: List(['a']),
    set: Set(['a']),
  });

  const withMap = WithMap();

  // $ExpectType { map: MapOf<{ a: string; }>; list: List<string>; set: Set<string>; }
  withMap.toJSON();

  // should be `{ map: { a: string; }; list: string[]; set: string[]; }` but there is an issue with circular references
  // $ExpectType { map: unknown; list: unknown; set: unknown; }
  withMap.toJS();
}

{
  // optional properties

  interface Size { distance: string; }

  const Line = Record<{ size?: Size, color?: string }>({ size: undefined, color: 'red' });

  const line = Line({});

  // should be  { size?: { distance: string; } | undefined; color?: string | undefined; } but there is an issue with circular references
  // $ExpectType { size?: unknown; color?: string | undefined; }
  line.toJS();
}

{
  // similar properties, but one is optional. See https://github.com/immutable-js/immutable-js/issues/1930

  interface Id { value: string; }

  type A = RecordOf<{ id: Id }>;
  type B = RecordOf<{ id?: Id }>;

  const a: A = null as any;
  const b: B = a;
}
