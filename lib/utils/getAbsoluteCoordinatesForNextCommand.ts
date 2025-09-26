import { AbsoluteCoords, OneOfShapeCommand } from '../parser/core/ShapeCommand';
import { SVGPathToken } from '../parser/normalize';
import { Point } from '../types/Geometry';

const reflectPoint = (point: Point, center: Point): Point => {
  return {
    x: center.x + (center.x - point.x),
    y: center.y + (center.y - point.y)
  };
};

export const getAbsoluteCoordinatesForNextCommand = (
  prevCommandOrPoint: OneOfShapeCommand | Point,
  token: SVGPathToken
): AbsoluteCoords => {
  const prevCoord = {
    x: 'command' in prevCommandOrPoint ? prevCommandOrPoint.coords.end.x : prevCommandOrPoint.x,
    y: 'command' in prevCommandOrPoint ? prevCommandOrPoint.coords.end.y : prevCommandOrPoint.y
  };

  const endX = 'x' in token ? (token.relative ? prevCoord.x + token.x : token.x) : prevCoord.x;
  const endY = 'y' in token ? (token.relative ? prevCoord.y + token.y : token.y) : prevCoord.y;
  const start = { x: prevCoord.x, y: prevCoord.y };
  const end = { x: endX, y: endY };

  const prevCommand = 'command' in prevCommandOrPoint ? prevCommandOrPoint : undefined;

  // For SmoothCurveTo we need to calculate h1 control point
  if (token.command === 'smooth curveto') {
    if (prevCommand?.command === 'curveto' || prevCommand?.command === 'smooth curveto') {
      // S/s: h1 is reflection of previous command's h2
      // S/s: h2 is calculated later
      const h1 = reflectPoint(prevCommand.helperCoords.h2, start);
      return {
        start,
        end,
        h1
      };
    } else {
      // If there is no previous command or previous command is not curveto/smooth curveto
      // then h1 is the same as start point
      return {
        start,
        end,
        h1: { x: start.x, y: start.y }
      };
    }
  }
  // For SmoothQuadraticCurveTo we need to calculate h1 control point
  if (token.command === 'smooth quadratic curveto') {
    if (
      prevCommand?.command === 'quadratic curveto' ||
      prevCommand?.command === 'smooth quadratic curveto'
    ) {
      // T/t: h1 is reflection of previous command's h1
      // T/t: h2 is not used in quadratic commands
      const h1 = reflectPoint(prevCommand.helperCoords.h1, start);
      return {
        start,
        end,
        h1
      };
    } else {
      // If there is no previous command or previous command is not quadratic curveto/smooth quadratic curveto
      // then h1 is the same as start point
      return {
        start,
        end,
        h1: { x: start.x, y: start.y }
      };
    }
  }

  // For other commands, no special handling is needed
  return {
    start,
    end
  };
};
