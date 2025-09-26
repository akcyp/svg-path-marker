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
  override move({ vy, moveRelative }: MoveOptions) {
    if (this.relative && !moveRelative) return;
    this.moveStartPoint({ vx: 0, vy, moveRelative });
    this.moveEndPoint({ vx: 0, vy, moveRelative });
  }
  override moveStartPoint({ vy }: MoveOptions) {
    super.moveStartPoint({ vx: 0, vy });
  }
  override moveEndPoint({ vy }: MoveOptions) {
    this.y += vy;
    super.moveEndPoint({ vx: 0, vy });
  }
}
