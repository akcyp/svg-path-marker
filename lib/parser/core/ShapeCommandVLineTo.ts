import { roundToPrecision } from '~/lib/utils/roundPointCoordinates';
import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandVLineTo extends ShapeCommand {
  public readonly command = 'vertical lineto';
  declare public readonly code: 'v' | 'V';
  public y!: number;
  constructor(token: SVGPathToken & { command: 'vertical lineto' }, coords: AbsoluteCoords) {
    super(token, coords);
    this._update(token);
  }
  override toString() {
    return `${this.code} ${this.y}`;
  }
  override update(command: ShapeCommandVLineTo) {
    super.update(command);
    this.y = command.y;
  }
  private _update(coords: Pick<ShapeCommandVLineTo, 'y'>) {
    this.y = coords.y;
  }
  override move(move: MoveOptions) {
    if (this.relative && !move.moveRelative) return;
    this.moveStartPoint({ ...move, vx: 0 });
    this.moveEndPoint({ ...move, vx: 0 });
  }
  override moveStartPoint(move: MoveOptions) {
    super.moveStartPoint({ ...move, vx: 0 });
  }
  override moveEndPoint(move: MoveOptions) {
    this.y = roundToPrecision(this.y + move.vy, move.precision);
    super.moveEndPoint({ ...move, vx: 0 });
  }
}
