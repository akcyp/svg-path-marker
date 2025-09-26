import {
  jsx,
  init,
  datasetModule,
  type VNode,
  propsModule,
  attributesModule,
  toVNode,
  styleModule
} from 'snabbdom';
import { jsxDomPropsModule } from 'snabbdom-transform-jsx-props';
import { Shape } from '../parser/core/Shape';
import { type OneOfShapeCommand } from '../parser/core/ShapeCommand';

const patcher = init([
  jsxDomPropsModule,
  datasetModule,
  propsModule,
  attributesModule,
  styleModule
]);

const getCommandAbsString = (command: OneOfShapeCommand, shape: Shape) => {
  if (command.command === 'closepath') {
    return `L ${shape.start.x} ${shape.start.y}`;
  }
  if (command.command === 'smooth curveto') {
    const { x: x1, y: y1 } = command.helperCoords.h1;
    const { x: x2, y: y2 } = command.helperCoords.h2;
    return `C ${x1} ${y1} ${x2} ${y2} ${command.coords.end.x} ${command.coords.end.y}`;
  }
  if (command.command === 'smooth quadratic curveto') {
    const { x: x1, y: y1 } = command.helperCoords.h1;
    return `Q ${x1} ${y1} ${command.coords.end.x} ${command.coords.end.y}`;
  }
  return command.toString();
};

export class Renderer {
  private shapes: Shape[] = [];
  private vdom: VNode;
  private d: string = '';
  private viewBox: string | null = null;

  constructor(private svg: SVGSVGElement) {
    this.vdom = patcher(toVNode(this.svg), this.render());
  }

  update(shapes: Shape[], d: string, viewBox: string | null) {
    this.viewBox = viewBox;
    this.d = d;
    this.shapes = shapes;
    this.vdom = patcher(this.vdom, this.render());
  }

  render(): VNode {
    return (
      <svg viewBox={this.viewBox ?? undefined}>
        <path key="d" d={this.d} data-type="debug" />
        {this.shapes.map((shape, index) => this.renderShape(shape, index))}
      </svg>
    );
  }

  renderShape(shape: Shape, index: number): VNode {
    const key = `shape-${index}`;
    const d = shape.toRendererString();
    const renderCommand = this.renderCommand.bind(this, shape, index);
    return (
      <g key={key} data-key={key}>
        <path data-type="path" d={d} />
        {shape.commands.filter((command) => command.relative).map(renderCommand)}
        {shape.commands.filter((command) => !command.relative).map(renderCommand)}
      </g>
    );
  }

  renderCommand(shape: Shape, shapeIndex: number, command: OneOfShapeCommand): VNode {
    const index = shape.commands.indexOf(command);
    const key = `shape-${shapeIndex}-c-${index}`;
    return (
      <g key={key} data-key={key} data-command={command.command} data-relative={command.relative}>
        {this.renderCommandHandlers(command)}
        <path
          data-type="path-fragment"
          d={`M ${command.coords.start.x} ${command.coords.start.y} ${getCommandAbsString(command, shape)}`}
        />
        <circle data-type="end" cx={command.coords.end.x} cy={command.coords.end.y} />
      </g>
    );
  }

  renderCommandHandlers(command: OneOfShapeCommand): VNode[] {
    const {
      coords: { start, end }
    } = command;
    switch (command.command) {
      case 'curveto': {
        const { x: x1, y: y1 } = command.helperCoords.h1;
        const { x: x2, y: y2 } = command.helperCoords.h2;
        return [
          <circle data-type="h1" cx={x1} cy={y1} />,
          <circle data-type="h2" cx={x2} cy={y2} />,
          <line data-type="line" x1={x1} y1={y1} x2={start.x} y2={start.y} />,
          <line data-type="line" x1={x2} y1={y2} x2={end.x} y2={end.y} />
        ];
      }
      case 'smooth curveto': {
        const { x: x1, y: y1 } = command.helperCoords.h1;
        const { x: x2, y: y2 } = command.helperCoords.h2;
        return [
          <circle data-type="h1:disabled" cx={x1} cy={y1} />,
          <circle data-type="h2" cx={x2} cy={y2} />,
          <line data-type="line:disabled" x1={x1} y1={y1} x2={start.x} y2={start.y} />,
          <line data-type="line" x1={x2} y1={y2} x2={end.x} y2={end.y} />
        ];
      }
      case 'quadratic curveto': {
        const { x: x1, y: y1 } = command.helperCoords.h1;
        return [
          <circle data-type="h1" cx={x1} cy={y1} />,
          <line data-type="line" x1={x1} y1={y1} x2={start.x} y2={start.y} />,
          <line data-type="line" x1={x1} y1={y1} x2={end.x} y2={end.y} />
        ];
      }
      case 'smooth quadratic curveto': {
        const { x: x1, y: y1 } = command.helperCoords.h1;
        return [
          <circle data-type="h1:disabled" cx={x1} cy={y1} />,
          <line data-type="line:disabled" x1={x1} y1={y1} x2={start.x} y2={start.y} />,
          <line data-type="line:disabled" x1={x1} y1={y1} x2={end.x} y2={end.y} />
        ];
      }
      case 'elliptical arc': {
        const { center, rx, ry } = command.helperCoords;

        // Midpoints of rx and ry lines
        const rxMid = {
          x: (center.cx + rx.x) / 2,
          y: (center.cy + rx.y) / 2
        };
        const ryMid = {
          x: (center.cx + ry.x) / 2,
          y: (center.cy + ry.y) / 2
        };

        // Angle for rx axis (from center to rx)
        const rxAngle = (Math.atan2(rx.y - center.cy, rx.x - center.cx) * 180) / Math.PI;
        // Angle for ry axis (from center to ry)
        const ryAngle = (Math.atan2(ry.y - center.cy, ry.x - center.cx) * 180) / Math.PI;

        // Rectangle sizes
        const rectW = 10;
        const rectH = 4;

        return [
          <circle data-type="arc-center" cx={center.cx} cy={center.cy} />,
          <line data-type="line" x1={center.cx} y1={center.cy} x2={rx.x} y2={rx.y} />,
          <rect
            data-type="rx-handle"
            x={rxMid.x - rectW / 2}
            y={rxMid.y - rectH / 2}
            width={rectW}
            height={rectH}
            style={{
              transform: `rotate(${rxAngle}deg)`,
              transformOrigin: `${rxMid.x}px ${rxMid.y}px`,
              cursor: 'ew-resize'
            }}
          />,
          <line data-type="line" x1={center.cx} y1={center.cy} x2={ry.x} y2={ry.y} />,
          <rect
            data-type="ry-handle"
            x={ryMid.x - rectW / 2}
            y={ryMid.y - rectH / 2}
            width={rectW}
            height={rectH}
            style={{
              transform: `rotate(${ryAngle}deg)`,
              transformOrigin: `${ryMid.x}px ${ryMid.y}px`,
              cursor: 'ns-resize'
            }}
          />
        ];
      }
    }
    return [];
  }
}
