import type { OneOfShapeCommand } from '~/lib/parser/core/ShapeCommand';
import type { SVGPathToken } from '~/lib/parser/normalize';
import type { Vector } from '../types/Geometry';
import { commandFromToken } from '~/lib/utils/commandFromToken';
import { getAbsoluteCoordinatesForNextCommand } from '~/lib/utils/getAbsoluteCoordinatesForNextCommand';

const tokenFromCode = (
  prev: OneOfShapeCommand,
  code: SVGPathToken['code'],
  margins: Vector
): SVGPathToken => {
  const relative = code.toLowerCase() === code;
  const x = relative ? margins.vx : prev.coords.end.x + margins.vx;
  const y = relative ? margins.vy : prev.coords.end.y + margins.vy;

  switch (code) {
    case 'M':
    case 'm':
      return { command: 'moveto', code, relative, x, y };
    case 'L':
    case 'l':
      return { command: 'lineto', code, relative, x, y };
    case 'V':
    case 'v':
      return { command: 'vertical lineto', code, relative, y };
    case 'H':
    case 'h':
      return { command: 'horizontal lineto', code, relative, x };
    case 'C':
    case 'c':
      return { command: 'curveto', code, relative, x, y, x1: x, x2: x, y1: y, y2: y };
    case 'S':
    case 's':
      return { command: 'smooth curveto', code, relative, x, y, x2: x, y2: y };
    case 'Q':
    case 'q':
      return { command: 'quadratic curveto', code, relative, x, y, x1: x, y1: y };
    case 'T':
    case 't':
      return { command: 'smooth quadratic curveto', code, relative, x, y };
    case 'A':
    case 'a':
      return {
        command: 'elliptical arc',
        code,
        relative,
        x,
        y,
        rx: margins.vx / 2,
        ry: margins.vy / 2,
        xAxisRotation: 0,
        sweep: false,
        largeArc: false
      };
    case 'Z':
    case 'z':
      return { command: 'closepath', code, relative };
  }
};

export const createCommandSuccessor = (
  prev: OneOfShapeCommand,
  code: SVGPathToken['code'],
  margins: Vector
): OneOfShapeCommand => {
  const token = tokenFromCode(prev, code, margins);
  const absCoords = getAbsoluteCoordinatesForNextCommand(prev, token);
  return commandFromToken(token, absCoords);
};
