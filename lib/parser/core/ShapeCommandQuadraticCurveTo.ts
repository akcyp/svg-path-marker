import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandQuadraticCurveTo extends ShapeCommand {
  public readonly command = 'quadratic curveto';
  declare public readonly code: 'q' | 'Q';
  public readonly helperCoords = {
    h1: { x: 0, y: 0 }
  };
  public x1!: number;
  public y1!: number;
  public x!: number;
  public y!: number;
  constructor(token: SVGPathToken & { command: 'quadratic curveto' }, coords: AbsoluteCoords) {
    super(token, coords);
    this._update(token);
  }
  override toString() {
    return `${this.code} ${this.x1} ${this.y1} ${this.x} ${this.y}`;
  }
  override update(command: ShapeCommandQuadraticCurveTo) {
    super.update(command);
    this._update(command);
  }
  private _update(coords: Pick<ShapeCommandQuadraticCurveTo, 'x' | 'y' | 'x1' | 'y1'>) {
    this.x = coords.x;
    this.y = coords.y;
    this.x1 = coords.x1;
    this.y1 = coords.y1;
    this.helperCoords.h1 = this.getAbsoultePointPosition(this.x1, this.y1);
  }
  override move({ vx, vy, moveRelative }: MoveOptions) {
    if (this.relative && !moveRelative) return;
    this.moveStartPoint({ vx, vy, moveRelative });
    this.moveEndPoint({ vx, vy, moveRelative });
    this.moveStartControlPoint({ vx, vy, moveRelative });
  }
  override moveStartPoint({ vx, vy }: MoveOptions) {
    super.moveStartPoint({ vx, vy });
  }
  override moveEndPoint({ vx, vy }: MoveOptions) {
    this.x += vx;
    this.y += vy;
    super.moveEndPoint({ vx, vy });
  }
  public moveStartControlPoint({ vx, vy }: MoveOptions) {
    this.x1 += vx;
    this.y1 += vy;
    this.helperCoords.h1.x += vx;
    this.helperCoords.h1.y += vy;
  }
}
