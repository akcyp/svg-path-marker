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
  override move({ vx, vy, moveRelative }: MoveOptions) {
    if (this.relative && !moveRelative) return;
    this.x += vx;
    this.y += vy;
    this.x2 += vx;
    this.y2 += vy;
  }
  override moveStartPoint({ vx, vy }: MoveOptions) {
    super.moveStartPoint({ vx, vy });
  }
  override moveEndPoint({ vx, vy }: MoveOptions) {
    this.x += vx;
    this.y += vy;
    super.moveEndPoint({ vx, vy });
  }
  public moveEndControlPoint({ vx, vy }: MoveOptions) {
    this.x2 += vx;
    this.y2 += vy;
    this.helperCoords.h2.x += vx;
    this.helperCoords.h2.y += vy;
  }
}
