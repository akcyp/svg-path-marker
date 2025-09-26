export const matrixTransformUserEvent = (e: MouseEvent | TouchEvent, svg: SVGSVGElement) => {
  const { clientX, clientY } =
    'changedTouches' in e && 'touches' in e ? e.changedTouches[0] || e.touches[0] : e;
  const ctm = svg.getScreenCTM();
  if (!ctm) throw new Error('ScreenCTM is null');
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const { x, y } = point.matrixTransform(ctm.inverse());
  return { x, y };
};
