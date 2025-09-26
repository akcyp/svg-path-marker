import type { AbsoluteCoords, OneOfShapeCommand } from '../parser/core/ShapeCommand';
import { ShapeCommandClosePath } from '../parser/core/ShapeCommandClosePath';
import { ShapeCommandCurveTo } from '../parser/core/ShapeCommandCurveTo';
import { ShapeCommandEllipticalArc } from '../parser/core/ShapeCommandEllipticalArc';
import { ShapeCommandHLineTo } from '../parser/core/ShapeCommandHLineTo';
import { ShapeCommandLineTo } from '../parser/core/ShapeCommandLineTo';
import { ShapeCommandMoveTo } from '../parser/core/ShapeCommandMoveTo';
import { ShapeCommandQuadraticCurveTo } from '../parser/core/ShapeCommandQuadraticCurveTo';
import { ShapeCommandSmoothCurveTo } from '../parser/core/ShapeCommandSmoothCurveTo';
import { ShapeCommandSmoothQuadraticCurveTo } from '../parser/core/ShapeCommandSmoothQuadraticCurveTo';
import { ShapeCommandVLineTo } from '../parser/core/ShapeCommandVLineTo';
import type { SVGPathToken } from '../parser/normalize';

export const commandFromToken = (
  token: SVGPathToken,
  coords: AbsoluteCoords
): OneOfShapeCommand => {
  switch (token.command) {
    case 'closepath':
      return new ShapeCommandClosePath(token, coords);
    case 'moveto':
      return new ShapeCommandMoveTo(token, coords);
    case 'lineto':
      return new ShapeCommandLineTo(token, coords);
    case 'vertical lineto':
      return new ShapeCommandVLineTo(token, coords);
    case 'horizontal lineto':
      return new ShapeCommandHLineTo(token, coords);
    case 'curveto':
      return new ShapeCommandCurveTo(token, coords);
    case 'smooth curveto':
      return new ShapeCommandSmoothCurveTo(token, coords);
    case 'elliptical arc':
      return new ShapeCommandEllipticalArc(token, coords);
    case 'quadratic curveto':
      return new ShapeCommandQuadraticCurveTo(token, coords);
    case 'smooth quadratic curveto':
      return new ShapeCommandSmoothQuadraticCurveTo(token, coords);
  }
};
