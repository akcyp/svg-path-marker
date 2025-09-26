import { Border } from '~/lib/utils/getBorderPoints';
import type { Point } from '../../types/Geometry';
import type { SVGPathToken } from '../normalize';
import type { ShapeCommandClosePath } from './ShapeCommandClosePath';
import type { ShapeCommandCurveTo } from './ShapeCommandCurveTo';
import type { ShapeCommandEllipticalArc } from './ShapeCommandEllipticalArc';
import type { ShapeCommandHLineTo } from './ShapeCommandHLineTo';
import type { ShapeCommandLineTo } from './ShapeCommandLineTo';
import type { ShapeCommandMoveTo } from './ShapeCommandMoveTo';
import type { ShapeCommandQuadraticCurveTo } from './ShapeCommandQuadraticCurveTo';
import type { ShapeCommandSmoothCurveTo } from './ShapeCommandSmoothCurveTo';
import type { ShapeCommandSmoothQuadraticCurveTo } from './ShapeCommandSmoothQuadraticCurveTo';
import type { ShapeCommandVLineTo } from './ShapeCommandVLineTo';

export type OneOfShapeCommand =
  | ShapeCommandClosePath
  | ShapeCommandMoveTo
  | ShapeCommandLineTo
  | ShapeCommandVLineTo
  | ShapeCommandHLineTo
  | ShapeCommandCurveTo
  | ShapeCommandSmoothCurveTo
  | ShapeCommandEllipticalArc
  | ShapeCommandQuadraticCurveTo
  | ShapeCommandSmoothQuadraticCurveTo;

export interface MoveOptions {
  moveRelative?: boolean;
  vx: number;
  vy: number;
}

export interface AbsoluteCoords {
  start: Point;
  end: Point;
  // For CurveTo, SmoothCurveTo, QuadraticCurveTo and SmoothQuadraticCurveTo
  h1?: Point;
  h2?: Point;
}

type RequiredFieldsOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

export abstract class ShapeCommand {
  public abstract readonly command: SVGPathToken['command'];
  public readonly relative: boolean;
  public readonly code: SVGPathToken['code'];
  public coords = {
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 }
  };
  constructor(
    public readonly token: SVGPathToken,
    coords: RequiredFieldsOnly<AbsoluteCoords>
  ) {
    this.relative = token.relative;
    this.code = token.code;
    Object.assign(this.coords.start, coords.start);
    Object.assign(this.coords.end, coords.end);
  }
  abstract toString(): string;
  abstract move({ vx, vy }: MoveOptions): void;
  moveStartPoint({ vx, vy }: MoveOptions) {
    this.coords.start.x += vx;
    this.coords.start.y += vy;
  }
  moveEndPoint({ vx, vy }: MoveOptions) {
    this.coords.end.x += vx;
    this.coords.end.y += vy;
  }
  public update(command: OneOfShapeCommand) {
    Object.assign(this.coords.start, command.coords.start);
    Object.assign(this.coords.end, command.coords.end);
  }
  protected getAbsoultePointPosition(rx: number, ry: number) {
    const x = this.relative ? this.coords.start.x + rx : rx;
    const y = this.relative ? this.coords.start.y + ry : ry;
    return { x, y };
  }
  public isInsideBorder(border: Border) {
    const { start: _, ...coords } = this.coords;
    return Object.values(coords).every((coord) => {
      return (
        coord.x >= border.topLeft.x &&
        coord.y >= border.topLeft.y &&
        coord.x <= border.bottomRight.x &&
        coord.y <= border.bottomRight.y
      );
    });
  }
}
