import type { MoveOptions } from '../parser/core/ShapeCommand';
import type { Point } from '../types/Geometry';

export const roundToPrecision = (value: number, p: number) => {
  const pow = Math.pow(10, p);
  return Math.round((value + Number.EPSILON) * pow) / pow;
};

export const roundPointCoordinates = ({
  x,
  y,
  precision = 0
}: Point & { precision?: number }): Point => ({
  x: roundToPrecision(x, precision),
  y: roundToPrecision(y, precision)
});

export const moveSmooth = (point: Point, move: MoveOptions) =>
  roundPointCoordinates({
    x: point.x + move.vx,
    y: point.y + move.vy,
    precision: move.precision
  });
