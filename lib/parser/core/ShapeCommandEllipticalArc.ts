import type { SVGPathToken } from '../normalize';
import { type AbsoluteCoords, type MoveOptions, ShapeCommand } from './ShapeCommand';

export class ShapeCommandEllipticalArc extends ShapeCommand {
  public readonly command = 'elliptical arc';
  declare public readonly code: 'a' | 'A';
  public readonly helperCoords = {
    center: { cx: 0, cy: 0 },
    rx: { x: 0, y: 0 },
    ry: { x: 0, y: 0 }
  };
  public rx!: number;
  public ry!: number;
  public xAxisRotation!: number;
  public largeArc!: boolean;
  public sweep!: boolean;
  public x!: number;
  public y!: number;
  constructor(token: SVGPathToken & { command: 'elliptical arc' }, coords: AbsoluteCoords) {
    super(token, coords);
    this._update(token);
  }
  override toString() {
    return `${this.code} ${this.rx} ${this.ry} ${this.xAxisRotation} ${+this.largeArc} ${+this.sweep} ${this.x} ${this.y}`;
  }
  override update(command: ShapeCommandEllipticalArc) {
    super.update(command);
    this._update(command);
  }
  private _updateHelperPoints() {
    const { center, rx, ry } = this.getHelperPoints();
    this.helperCoords.center = center;
    this.helperCoords.rx = rx;
    this.helperCoords.ry = ry;
  }
  private _update(
    attributes: Pick<
      ShapeCommandEllipticalArc,
      'x' | 'y' | 'rx' | 'ry' | 'xAxisRotation' | 'largeArc' | 'sweep'
    >
  ) {
    this.rx = attributes.rx;
    this.ry = attributes.ry;
    this.xAxisRotation = attributes.xAxisRotation;
    this.largeArc = attributes.largeArc;
    this.sweep = attributes.sweep;
    this.x = attributes.x;
    this.y = attributes.y;
    this._updateHelperPoints();
  }
  override move({ vx, vy, moveRelative }: MoveOptions) {
    if (this.relative && !moveRelative) return;
    this.moveStartPoint({ vx, vy, moveRelative });
    this.moveEndPoint({ vx, vy, moveRelative });
    this._updateHelperPoints();
  }
  override moveStartPoint({ vx, vy }: MoveOptions) {
    super.moveStartPoint({ vx, vy });
    this._updateHelperPoints();
  }
  override moveEndPoint({ vx, vy }: MoveOptions) {
    this.x += vx;
    this.y += vy;
    super.moveEndPoint({ vx, vy });
    this._updateHelperPoints();
  }
  public setXAxisRotation(angle: number) {
    this.xAxisRotation = angle;
    this._updateHelperPoints();
  }
  public toggleLargeArc() {
    this.largeArc = !this.largeArc;
    this._updateHelperPoints();
  }
  public toggleSweep() {
    this.sweep = !this.sweep;
    this._updateHelperPoints();
  }
  private getXAxisRotationRadians() {
    return (this.xAxisRotation * Math.PI) / 180;
  }
  private getHelperPoints() {
    const x1 = this.coords.start.x;
    const x2 = this.coords.end.x;
    const y1 = this.coords.start.y;
    const y2 = this.coords.end.y;

    let rx = this.rx;
    let ry = this.ry;
    // Convert angle from degrees to radians
    const phiRad = this.getXAxisRotationRadians();
    // Step 1: Compute (x1', y1')
    const dx = (x1 - x2) / 2;
    const dy = (y1 - y2) / 2;
    const x1p = Math.cos(phiRad) * dx + Math.sin(phiRad) * dy;
    const y1p = -Math.sin(phiRad) * dx + Math.cos(phiRad) * dy;

    // Step 2: Compute (cx', cy')
    let rxSq = rx ** 2;
    let rySq = ry ** 2;
    const x1pSq = x1p * x1p;
    const y1pSq = y1p * y1p;

    // Correct radii if necessary
    const radiiCheck = x1pSq / rxSq + y1pSq / rySq;
    let scale = 1;
    if (radiiCheck > 1) {
      scale = Math.sqrt(radiiCheck);
      rx *= scale;
      ry *= scale;
      rxSq = rx ** 2;
      rySq = ry ** 2;
    }

    const sign = this.largeArc !== this.sweep ? 1 : -1;
    const sq = (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) / (rxSq * y1pSq + rySq * x1pSq);
    const coef = sign * Math.sqrt(Math.max(0, sq));

    const cxp = coef * ((rx * y1p) / ry);
    const cyp = coef * (-(ry * x1p) / rx);

    // Step 3: Compute (cx, cy)
    const cx = Math.cos(phiRad) * cxp - Math.sin(phiRad) * cyp + (x1 + x2) / 2;
    const cy = Math.sin(phiRad) * cxp + Math.cos(phiRad) * cyp + (y1 + y2) / 2;

    const rxPt = {
      x: cx + rx * Math.cos(phiRad),
      y: cy + rx * Math.sin(phiRad)
    };
    const ryPt = {
      x: cx - ry * Math.sin(phiRad),
      y: cy + ry * Math.cos(phiRad)
    };

    return {
      center: { cx, cy },
      rx: rxPt,
      ry: ryPt
    };
  }
  public moveRx({ vx, vy }: MoveOptions) {
    // Move only along the rx axis direction (ellipse major axis)
    const phiRad = this.getXAxisRotationRadians();
    // Axis direction vector
    const axis = { x: Math.cos(phiRad), y: Math.sin(phiRad) };
    // Project movement onto axis
    const delta = vx * axis.x + vy * axis.y;
    // Update radius
    this.rx = Math.max(0.1, this.rx + delta);
    this._updateHelperPoints();
  }
  public moveRy({ vx, vy }: MoveOptions) {
    // Move only along the ry axis direction (ellipse minor axis, perpendicular to rx)
    const phiRad = this.getXAxisRotationRadians();
    // Axis direction vector (perpendicular)
    const axis = { x: -Math.sin(phiRad), y: Math.cos(phiRad) };
    // Project movement onto axis
    const delta = vx * axis.x + vy * axis.y;
    // Update radius
    this.ry = Math.max(0.1, this.ry + delta);
    this._updateHelperPoints();
  }
}
