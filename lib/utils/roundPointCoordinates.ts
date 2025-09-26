import { Point } from '../types/Geometry';

export const roundPointCoordinates = ({ x, y }: Point, p = 1): Point => ({
  x: Math.round((x + Number.EPSILON) * p) / p,
  y: Math.round((y + Number.EPSILON) * p) / p
});
