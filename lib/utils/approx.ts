import { Point } from '../types/Geometry';

export const getDistance = (p1: Point, p2: Point) => {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
};

export const getAngle = (p1: Point, p2: Point) => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

export const approximateToAnAngleMultiplicity = (
  startPoint: Point,
  endPoint: Point,
  minAngle: number
): Point => {
  const r = getDistance(startPoint, endPoint);
  const angle = getAngle(startPoint, endPoint);
  const newAngle = Math.round(angle / minAngle) * minAngle;
  return {
    x: startPoint.x + r * Math.cos(newAngle),
    y: startPoint.y + r * Math.sin(newAngle)
  };
};

export const approximateToAngles = (
  startPoint: Point,
  endPoint: Point,
  angles: number[]
): Point => {
  const r = getDistance(startPoint, endPoint);
  const angle = getAngle(startPoint, endPoint);
  const nearestAngle = angles.reduce(
    (prev, now) => (Math.abs(now - angle) < Math.abs(prev - angle) ? now : prev),
    Infinity
  );
  if (nearestAngle !== Infinity) {
    endPoint.x = startPoint.x + r * Math.cos(nearestAngle);
    endPoint.y = startPoint.y + r * Math.sin(nearestAngle);
  }
  return endPoint;
};

export const calculateAnglesBeetwenPoints = (points: Point[]) => {
  const angles: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const alpha = Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x);
    const alpha2 = alpha + Math.PI;
    angles.push(alpha, alpha2 > Math.PI ? alpha2 - 2 * Math.PI : alpha2);
  }
  return angles.filter((val, idx, arr) => arr.indexOf(val) === idx);
};
