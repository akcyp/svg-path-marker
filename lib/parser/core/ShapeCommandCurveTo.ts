import { moveSmooth } from '~/lib/utils/roundPointCoordinates';
import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandCurveTo extends ShapeCommand {
  public readonly command = 'curveto';
  declare public readonly code: 'c' | 'C';
  public readonly helperCoords = {
    h1: { x: 0, y: 0 },
    h2: { x: 0, y: 0 }
  };
  public x1!: number;
  public y1!: number;
  public x2!: number;
  public y2!: number;
  public x!: number;
  public y!: number;
  constructor(token: SVGPathToken & { command: 'curveto' }, coords: AbsoluteCoords) {
    super(token, coords);
    this._update(token);
  }
  override toString() {
    return `${this.code} ${this.x1} ${this.y1} ${this.x2} ${this.y2} ${this.x} ${this.y}`;
  }
  override update(command: ShapeCommandCurveTo) {
    super.update(command);
    this._update(command);
  }
  private _update(coords: Pick<ShapeCommandCurveTo, 'x' | 'y' | 'x1' | 'y1' | 'x2' | 'y2'>) {
    this.x = coords.x;
    this.y = coords.y;
    this.x1 = coords.x1;
    this.y1 = coords.y1;
    this.x2 = coords.x2;
    this.y2 = coords.y2;
    this.helperCoords.h1 = this.getAbsoultePointPosition(this.x1, this.y1);
    this.helperCoords.h2 = this.getAbsoultePointPosition(this.x2, this.y2);
  }
  override move(move: MoveOptions) {
    if (this.relative && !move.moveRelative) return;
    this.moveStartPoint(move);
    this.moveEndPoint(move);
    this.moveStartControlPoint(move);
    this.moveEndControlPoint(move);
  }
  override moveStartPoint(move: MoveOptions) {
    super.moveStartPoint(move);
  }
  override moveEndPoint(move: MoveOptions) {
    Object.assign(this, moveSmooth(this, move));
    super.moveEndPoint(move);
  }
  public moveStartControlPoint(move: MoveOptions) {
    const { x: x1, y: y1 } = moveSmooth({ x: this.x1, y: this.y1 }, move);
    this.x1 = x1;
    this.y1 = y1;

    this.helperCoords.h1 = moveSmooth(this.helperCoords.h1, move);
  }
  public moveEndControlPoint(move: MoveOptions) {
    const { x: x2, y: y2 } = moveSmooth({ x: this.x2, y: this.y2 }, move);
    this.x2 = x2;
    this.y2 = y2;

    this.helperCoords.h2 = moveSmooth(this.helperCoords.h2, move);
  }
}
