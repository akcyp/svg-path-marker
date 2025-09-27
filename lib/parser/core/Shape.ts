import { getAbsoluteCoordinatesForNextCommand } from '~/lib/utils/getAbsoluteCoordinatesForNextCommand';
import type { Point } from '../../types/Geometry';
import type { SVGPathToken } from '../normalize';
import type { MoveOptions, OneOfShapeCommand } from './ShapeCommand';
import { commandFromToken } from '../../utils/commandFromToken';
import { Border } from '~/lib/utils/getBorderPoints';

export class Shape {
  public readonly start = { x: 0, y: 0 };
  public readonly end = { x: 0, y: 0 };
  public closed = false;
  public readonly commands: OneOfShapeCommand[] = [];
  constructor(startCoords: Point) {
    this.start.x = startCoords.x;
    this.start.y = startCoords.y;
    this.end.x = startCoords.x;
    this.end.y = startCoords.y;
  }

  add(token: SVGPathToken) {
    if (this.closed) {
      throw new Error('Cannot add commands to closed path');
    }

    const coords = getAbsoluteCoordinatesForNextCommand(this.commands.at(-1) ?? this.end, token);

    if (token.command === 'moveto') {
      this.start.x = coords.end.x;
      this.start.y = coords.end.y;
    }
    if (token.command === 'closepath') {
      this.closed = true;
      this.end.x = this.start.x;
      this.end.y = this.start.y;
    } else {
      this.end.x = coords.end.x;
      this.end.y = coords.end.y;
    }
    const command = commandFromToken(token, coords);
    this.commands.push(command);
  }
  toJSON() {
    return this.commands.map((command) => command.toString());
  }
  toRendererString() {
    // Convert shape to string suitable for 'd' attribute in SVG as independent shape
    // This means that the first command should always be absolute moveto (M)
    if (this.commands.length === 0) return '';
    const [first, ...rest] = this.commands;
    const initialPoint = `M ${this.start.x} ${this.start.y} `;
    const restPoints = rest.map((c) => c.toString()).join(' ');
    if (first.command === 'moveto') {
      if (first.relative) return `${initialPoint} ${restPoints}`;
      return `${first.toString()} ${restPoints}`;
    }
    return `${initialPoint} ${first.toString()} ${restPoints}`;
  }
  toString() {
    return this.toJSON().join(' ');
  }
  clone() {
    const shape = new Shape(this.start);
    this.commands.forEach((command) => shape.add(command.token));
    return shape;
  }
  move({ vx, vy, precision }: Omit<MoveOptions, 'moveRelative'>) {
    this.commands.forEach((command, i) => {
      command.move({
        vx,
        vy,
        precision,
        // Do not move relative commands, only the first one
        moveRelative: i === 0 && command.command === 'moveto'
      });
    });
    // Update start point
    this.start.x = this.commands.at(0)?.coords?.start?.x ?? this.start.x;
    this.start.y = this.commands.at(0)?.coords?.start?.y ?? this.start.y;
    // Update end point
    this.end.x = this.commands.at(-1)?.coords?.end?.x ?? this.end.x;
    this.end.y = this.commands.at(-1)?.coords?.end?.y ?? this.end.y;
  }

  private _recalculateCoords() {
    let current = { x: this.start.x, y: this.start.y };
    this.commands.forEach((cmd) => {
      // Recalculate coordinates for each command
      const coords = getAbsoluteCoordinatesForNextCommand(current, cmd.token);
      cmd.coords = coords;
      current = coords.end;
    });
    // Update shape's end point
    if (this.commands.length > 0) {
      this.end.x = current.x;
      this.end.y = current.y;
    } else {
      this.end.x = this.start.x;
      this.end.y = this.start.y;
    }
  }
  public toggleClose() {
    if (this.closed) {
      this.remove(this.commands.find((cmd) => cmd.command === 'closepath')!);
    } else {
      this.add({
        code: 'Z',
        command: 'closepath',
        relative: false
      });
    }
  }

  insertAfter(sibiling: OneOfShapeCommand, newCommand: OneOfShapeCommand) {
    const index = this.commands.indexOf(sibiling);
    this.commands.splice(index + 1, 0, newCommand);
    this._recalculateCoords();
  }

  remove(cmd: OneOfShapeCommand) {
    const index = this.commands.indexOf(cmd);
    this.commands.splice(index, 1);
    this._recalculateCoords();
  }

  isInsideBorder(borderPoints: Border) {
    return this.commands.every((command) => command.isInsideBorder(borderPoints));
  }
}
