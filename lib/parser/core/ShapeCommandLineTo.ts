import { moveSmooth } from '~/lib/utils/roundPointCoordinates';
import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandLineTo extends ShapeCommand {
  public readonly command = 'lineto';
  declare public readonly code: 'l' | 'L';
  public x!: number;
  public y!: number;
  constructor(token: SVGPathToken & { command: 'lineto' }, coords: AbsoluteCoords) {
    super(token, coords);
    this._update(token);
  }
  override toString() {
    return `${this.code} ${this.x} ${this.y}`;
  }
  override update(command: ShapeCommandLineTo) {
    super.update(command);
    this._update(command);
  }
  private _update(coords: Pick<ShapeCommandLineTo, 'x' | 'y'>) {
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
