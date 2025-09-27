import { moveSmooth } from '~/lib/utils/roundPointCoordinates';
import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandSmoothQuadraticCurveTo extends ShapeCommand {
  public readonly command = 'smooth quadratic curveto';
  declare public readonly code: 't' | 'T';
  public readonly helperCoords = {
    h1: { x: 0, y: 0 }
  };
  public x!: number;
  public y!: number;
  constructor(
    token: SVGPathToken & { command: 'smooth quadratic curveto' },
    coords: AbsoluteCoords
  ) {
    super(token, coords);
    this._update(token);
    if (!coords.h1) {
      throw new Error('helperCoords.h1 is required for smooth quadratic curveto command');
    }
    Object.assign(this.helperCoords.h1, coords.h1);
  }
  override toString() {
    return `${this.code} ${this.x} ${this.y}`;
  }
  override update(command: ShapeCommandSmoothQuadraticCurveTo) {
    super.update(command);
    this._update(command);
    Object.assign(this.helperCoords.h1, command.helperCoords.h1);
  }
  private _update(coords: Pick<ShapeCommandSmoothQuadraticCurveTo, 'x' | 'y'>) {
    this.x = coords.x;
    this.y = coords.y;
  }
  override move(move: MoveOptions) {
    if (this.relative && !move.moveRelative) return;
    this.moveStartPoint(move);
    this.moveEndPoint(move);
  }
  override moveStartPoint(move: MoveOptions) {
    super.moveStartPoint(move);
  }
  override moveEndPoint(move: MoveOptions) {
    Object.assign(this, moveSmooth(this, move));
    super.moveEndPoint(move);
  }
}
