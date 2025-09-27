import { roundToPrecision } from '~/lib/utils/roundPointCoordinates';
import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandHLineTo extends ShapeCommand {
  public readonly command = 'horizontal lineto';
  declare public readonly code: 'h' | 'H';
  public x!: number;
  constructor(token: SVGPathToken & { command: 'horizontal lineto' }, coords: AbsoluteCoords) {
    super(token, coords);
    this._update(token);
  }
  override toString() {
    return `${this.code} ${this.x}`;
  }
  override update(command: ShapeCommandHLineTo) {
    super.update(command);
    this._update(command);
  }
  private _update(coords: Pick<ShapeCommandHLineTo, 'x'>) {
    this.x = coords.x;
  }
  override move(move: MoveOptions) {
    if (this.relative && !move.moveRelative) return;
    this.moveStartPoint(move);
    this.moveEndPoint(move);
  }
  override moveStartPoint(move: MoveOptions) {
    super.moveStartPoint({ ...move, vy: 0 });
  }
  override moveEndPoint(move: MoveOptions) {
    this.x = roundToPrecision(this.x + move.vx, move.precision);
    super.moveEndPoint({ ...move, vy: 0 });
  }
}
