// TypeScript Version: 2.2.1

import { Record } from '../../../';

{ // Factory
  const PointXY = Record({ x: 0, y: 0 });

  // $ExpectType Class<{ x: number; y: number; }>
  PointXY;

  // $ ExpectError
  PointXY({ x: 'a' }); // FIXME

  const pointXY = PointXY();

  // $ExpectType any
  pointXY; // FIXME

  // $ExpectType any
  pointXY.x; // FIXME

  // $ ExpectError
  pointXY.x = 10; // FIXME

  // $ExpectType any
  pointXY.y; // FIXME

  // $ ExpectError
  pointXY.y = 10; // FIXME

  // $ExpectError
  class PointClass extends PointXY { // FIXME
    setX(x: number) {
      // $ExpectError
      return this.set('x', x);
    }

    setY(y: number) {
      // $ExpectError
      return this.set('y', y);
    }
  }

  const point = new PointClass();

  // $ExpectType PointClass
  point;

  // $ExpectType any
  point.x; // $ExpectError FIXME

  // $ExpectType any
  point.y; // $ExpectError FIXME

  // $ ExpectType PointClass
  point.setX(10); // FIXME

  // $ ExpectType PointClass
  point.setY(10); // FIXME
}

{ // .getDescriptiveName
  const PointXY = Record({ x: 0, y: 0 });

  // $ExpectType string
  Record.getDescriptiveName(PointXY());

  // $ExpectError
  Record.getDescriptiveName({});
}
