import { Point } from '../types/Geometry';

const createPoint = (svg: SVGSVGElement, x: number, y: number) => {
  const point = svg.createSVGPoint();
  point.x = x;
  point.y = y;
  return point;
};

export interface Border {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export const getBorderPoints = (svg: SVGSVGElement): Border => {
  const rect = svg.getBoundingClientRect();
  const ctm = svg.getScreenCTM();
  if (!ctm) throw new Error('ScreenCTM is null');
  const inversed = ctm.inverse();
  const topLeft = createPoint(svg, rect.left, rect.top).matrixTransform(inversed);
  const topRight = createPoint(svg, rect.left + rect.width, rect.top).matrixTransform(inversed);
  const bottomLeft = createPoint(svg, rect.left, rect.top + rect.height).matrixTransform(inversed);
  const bottomRight = createPoint(
    svg,
    rect.left + rect.width,
    rect.top + rect.height
  ).matrixTransform(inversed);
  return { topLeft, topRight, bottomLeft, bottomRight };
};
