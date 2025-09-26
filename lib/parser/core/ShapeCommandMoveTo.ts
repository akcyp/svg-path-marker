import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandMoveTo extends ShapeCommand {
  public readonly command = 'moveto';
  declare public readonly code: 'm' | 'M';
  public x!: number;
  public y!: number;
  constructor(token: SVGPathToken & { command: 'moveto' }, coords: AbsoluteCoords) {
    super(token, coords);
    this._update(token);
  }
  override toString() {
    return `${this.code} ${this.x} ${this.y}`;
  }
  override update(command: ShapeCommandMoveTo) {
    super.update(command);
    this._update(command);
  }
  private _update(coords: Pick<ShapeCommandMoveTo, 'x' | 'y'>) {
    this.x = coords.x;
    this.y = coords.y;
  }
  override move({ vx, vy, moveRelative }: MoveOptions) {
    if (this.relative && !moveRelative) return;
    this.moveEndPoint({ vx, vy, moveRelative });
  }
  override moveStartPoint({ vx, vy }: MoveOptions) {
    super.moveStartPoint({ vx, vy });
  }
  override moveEndPoint({ vx, vy }: MoveOptions) {
    this.x += vx;
    this.y += vy;
    super.moveEndPoint({ vx, vy });
  }
}
