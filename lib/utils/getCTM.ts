// https://www.w3.org/TR/SVGTiny12/coords.html#TransformMatrixDefined
export const getCTM = (svg: SVGSVGElement) => {
  let ctm = svg.getCTM();
  if (!ctm) {
    // Some browsers have problems reading CTM from SVGSVGElement so we'll use hidden rect element as fallback
    const ctmHelper = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ctmHelper.setAttribute('visibility', 'hidden');
    svg.append(ctmHelper);
    ctm = ctmHelper.getCTM();
    svg.removeChild(ctmHelper);
  }
  if (!ctm) {
    throw new Error('Failed to read SVG CTM');
  }
  return ctm;
};
