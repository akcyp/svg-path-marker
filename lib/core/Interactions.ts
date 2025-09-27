import { Shape } from '../parser/core/Shape';
import { DraggableAPI } from './DraggableAPI';
import { matrixTransformUserEvent } from '../utils/matrixTransformUserEvent';
import { parsePath } from '../parser/parse';
import { getFigureFromTarget, isDraggableElement } from './domHelpers';
import { ControlsAPI } from './ControlsAPI';
import { roundPointCoordinates } from '../utils/roundPointCoordinates';
import { getBorderPoints } from '../utils/getBorderPoints';

interface Context {
  setState(state: string, value: boolean): void;
  updateShapes(shapes: Shape[]): void;
}

export class Interactions {
  public readonly draggableAPI: DraggableAPI;
  public readonly controlsAPI: ControlsAPI;
  private shapes: Shape[] = [];
  private precision = 1;
  constructor(
    private svg: SVGSVGElement,
    private tooltip: HTMLDivElement,
    private context: Context
  ) {
    // Command popover controller
    this.controlsAPI = new ControlsAPI(this.svg, this.tooltip, {
      updateShapes: (shapes) => {
        this.tryUpdate(shapes);
      }
    });
    // Draggable elements controller
    this.draggableAPI = new DraggableAPI(this.svg, {
      isDraggableElement: isDraggableElement,
      onDragStart: () => {
        this.context.setState('drag', true);
      },
      onDrag: (vector, modifiers, target) => {
        const { shape, command } = getFigureFromTarget(this.shapes, target, {
          fragmentsAsPath: true
        });
        const type = target.getAttribute('data-type')!;
        const { vx, vy } = vector;
        if (!shape) return;
        // Move entire shape
        if (!command) {
          shape.move({ vx, vy, precision: this.precision });
          this.tryUpdate(this.shapes);
          return;
        }
        // Do not move relative commands
        if (command.relative) return;
        if (type === 'end') {
          if (modifiers.shiftKey) {
            command.move({ vx, vy, moveRelative: true, precision: this.precision });
          } else {
            command.moveEndPoint({ vx, vy, precision: this.precision });
          }
        }
        if (type === 'h1' && 'x1' in command && 'y1' in command) {
          command.moveStartControlPoint({ vx, vy, precision: this.precision });
        }
        if (type === 'h2' && 'x2' in command && 'y2' in command) {
          command.moveEndControlPoint({ vx, vy, precision: this.precision });
        }
        if (type === 'rx-handle' && 'rx' in command) {
          command.moveRx({ vx, vy, precision: this.precision });
        }
        if (type === 'ry-handle' && 'ry' in command) {
          command.moveRy({ vx, vy, precision: this.precision });
        }
        this.tryUpdate(this.shapes);
      },
      onDragEnd: () => {
        this.context.setState('drag', false);
        this.tryUpdate(this.shapes);
      }
    });
  }

  private tryUpdate(shapes: Shape[]) {
    const border = getBorderPoints(this.svg);
    if (shapes.every((shape) => shape.isInsideBorder(border))) {
      this.beforeUpdateState = this.shapes;
      this.context.updateShapes(this.shapes);
      return true;
    }
    this.shapes = this.beforeUpdateState.map((shape) => shape.clone());
    return false;
  }

  private beforeUpdateState: Shape[] = [];
  public update(shapes?: Shape[]) {
    if (shapes) {
      this.shapes = shapes;
      this.beforeUpdateState = shapes.map((s) => s.clone());
    }
    this.controlsAPI.update(shapes);
  }

  public setPrecision(precision: number) {
    this.precision = precision;
  }

  // Custom interactions
  private onDblClick = (e: MouseEvent | TouchEvent) => {
    const coords = matrixTransformUserEvent(e, this.svg);
    const { x, y } = roundPointCoordinates({
      ...coords,
      precision: 1
    });
    const [newShape] = parsePath(`M ${x} ${y}`);
    this.shapes.push(newShape);
    this.tryUpdate(this.shapes);
    this.controlsAPI.show('operation', `shape-${this.shapes.length - 1}-c-0`);
  };

  private holdStart: number = 0;
  private onTapHoldStart = (_: TouchEvent) => {
    this.holdStart = Date.now();
  };
  private onTapHoldMove = (_: TouchEvent) => {
    // Ignore tap hold when moved
    this.holdStart = 0;
  };
  private onTapHoldEnd = (e: TouchEvent) => {
    if (this.holdStart > 0) {
      const tapLength = Date.now() - this.holdStart;
      if (tapLength > 200) this.onDblClick(e);
      else this.controlsAPI.onClick(e);
    }
    this.holdStart = 0;
  };

  init() {
    this.svg.addEventListener('dblclick', this.onDblClick);
    this.svg.addEventListener('touchstart', this.onTapHoldStart);
    this.svg.addEventListener('touchmove', this.onTapHoldMove);
    this.svg.addEventListener('touchend', this.onTapHoldEnd);
    this.controlsAPI.register();
    this.draggableAPI.register();
  }
  destroy() {
    this.svg.removeEventListener('dblclick', this.onDblClick);
    this.svg.removeEventListener('touchstart', this.onTapHoldStart);
    this.svg.removeEventListener('touchmove', this.onTapHoldMove);
    this.svg.removeEventListener('touchend', this.onTapHoldEnd);
    this.controlsAPI.destroy();
    this.draggableAPI.destroy();
  }
}
