/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Record } from '../../';

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
}

{
  // .getDescriptiveName
  const PointXY = Record({ x: 0, y: 0 });

  // $ExpectType string
  Record.getDescriptiveName(PointXY());

  // $ExpectError
  Record.getDescriptiveName({});
}
