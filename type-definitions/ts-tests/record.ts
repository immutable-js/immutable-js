import { List, Map, Record, Set } from 'immutable';

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

  // should be `{ map: { [x: string]: string; }; list: string[]; set: string[]; }` but there is an issue with circular references
  // $ExpectType { map: unknown; list: unknown; set: unknown; }
  withMap.toJS();
}
