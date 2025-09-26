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
  override move({ vx, vy, moveRelative }: MoveOptions) {
    if (this.relative && !moveRelative) return;
    this.moveStartPoint({ vx, vy, moveRelative });
    this.moveEndPoint({ vx, vy, moveRelative });
  }
  override moveStartPoint({ vx }: MoveOptions) {
    super.moveStartPoint({ vx, vy: 0 });
  }
  override moveEndPoint({ vx }: MoveOptions) {
    this.x += vx;
    super.moveEndPoint({ vx, vy: 0 });
  }
}
