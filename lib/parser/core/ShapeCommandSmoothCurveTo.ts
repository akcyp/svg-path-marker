import { moveSmooth } from '~/lib/utils/roundPointCoordinates';
import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandSmoothCurveTo extends ShapeCommand {
  public readonly command = 'smooth curveto';
  declare public readonly code: 's' | 'S';
  public readonly helperCoords = {
    h1: { x: 0, y: 0 },
    h2: { x: 0, y: 0 }
  };
  public x2!: number;
  public y2!: number;
  public x!: number;
  public y!: number;
  constructor(token: SVGPathToken & { command: 'smooth curveto' }, coords: AbsoluteCoords) {
    super(token, coords);
    this._update(token);
    if (!coords.h1) {
      throw new Error('helperCoords.h1 is required for smooth curveto command');
    }
    Object.assign(this.helperCoords.h1, coords.h1);
  }
  override toString() {
    return `${this.code} ${this.x2} ${this.y2} ${this.x} ${this.y}`;
  }
  override update(command: ShapeCommandSmoothCurveTo) {
    super.update(command);
    this._update(command);
    Object.assign(this.helperCoords.h1, command.helperCoords.h1);
  }
  private _update(coords: Pick<ShapeCommandSmoothCurveTo, 'x' | 'y' | 'x2' | 'y2'>) {
    this.x = coords.x;
    this.y = coords.y;
    this.x2 = coords.x2;
    this.y2 = coords.y2;
    this.helperCoords.h2 = this.getAbsoultePointPosition(this.x2, this.y2);
  }
  override move(move: MoveOptions) {
    if (this.relative && !move.moveRelative) return;
    this.moveStartPoint(move);
    this.moveEndPoint(move);
    this.moveEndControlPoint(move);
  }
  override moveStartPoint(move: MoveOptions) {
    super.moveStartPoint(move);
  }
  override moveEndPoint(move: MoveOptions) {
    Object.assign(this, moveSmooth(this, move));
    super.moveEndPoint(move);
  }
  public moveEndControlPoint(move: MoveOptions) {
    const { x: x2, y: y2 } = moveSmooth({ x: this.x2, y: this.y2 }, move);
    this.x2 = x2;
    this.y2 = y2;

    this.helperCoords.h2 = moveSmooth(this.helperCoords.h2, move);
  }
}
