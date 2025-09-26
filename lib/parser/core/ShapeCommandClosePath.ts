import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, ShapeCommand } from './ShapeCommand';

export class ShapeCommandClosePath extends ShapeCommand {
  public readonly command = 'closepath';
  declare public readonly code: 'z' | 'Z';
  constructor(token: SVGPathToken & { command: 'closepath' }, coords: AbsoluteCoords) {
    super(token, coords);
  }
  override toString() {
    return `${this.code}`;
  }
  override update(command: ShapeCommandClosePath) {
    super.update(command);
  }
  override move(): void {}
  override moveStartPoint(): void {}
  override moveEndPoint(): void {}
}
