import { Point, Vector } from '../types/Geometry';
import { matrixTransformUserEvent } from '../utils/matrixTransformUserEvent';

type CursorEvent = TouchEvent | MouseEvent;

export interface DragEventModifiers {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export interface DraggableProps {
  isDraggableElement: (element: SVGElement) => boolean;
  onDragStart: (arg: Point, modifiers: DragEventModifiers, element: SVGElement) => void;
  onDrag: (arg: Vector, modifiers: DragEventModifiers, element: SVGElement) => void;
  onDragEnd: (arg: Point, modifiers: DragEventModifiers, element: SVGElement) => void;
}

export class DraggableAPI {
  private dragLastPosition = null as Point | null;
  private wasMoved = false;
  private element = null as SVGElement | null;
  private modifiers = null as DragEventModifiers | null;
  constructor(
    private svg: SVGSVGElement,
    private handlers: DraggableProps
  ) {}

  public register() {
    this.svg.addEventListener('mousedown', this.onMouseTouchDown, true);
    this.svg.addEventListener('touchstart', this.onMouseTouchDown, true);
    window.addEventListener('mousemove', this.onMouseTouchMove, true);
    window.addEventListener('touchmove', this.onMouseTouchMove, true);
    window.addEventListener('mouseup', this.onMouseTouchUp, true);
    window.addEventListener('touchend', this.onMouseTouchUp, true);
  }
  public destroy() {
    this.svg.removeEventListener('mousedown', this.onMouseTouchDown);
    this.svg.removeEventListener('touchstart', this.onMouseTouchDown);
    window.removeEventListener('mousemove', this.onMouseTouchMove);
    window.removeEventListener('touchmove', this.onMouseTouchMove);
    window.removeEventListener('mouseup', this.onMouseTouchUp);
    window.removeEventListener('touchend', this.onMouseTouchUp);
  }

  private getCoordinates(e: CursorEvent) {
    return matrixTransformUserEvent(e, this.svg);
  }

  private extractModifiers(e: CursorEvent): DragEventModifiers {
    return {
      altKey: e.altKey,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey
    };
  }

  // Events
  private onMouseTouchDown = (e: CursorEvent) => {
    const [target] = e.composedPath();
    if (!target || !(target instanceof SVGElement) || !this.handlers.isDraggableElement(target))
      return;
    this.element = target;
    this.dragLastPosition = this.getCoordinates(e);
    this.wasMoved = false;
    this.modifiers = this.extractModifiers(e);
    this.svg.focus({ preventScroll: true });
    this.handlers.onDragStart(
      {
        x: this.dragLastPosition.x,
        y: this.dragLastPosition.y
      },
      this.modifiers,
      this.element
    );
  };

  private onMouseTouchMove = (e: CursorEvent) => {
    if (!this.dragLastPosition) return;
    // e.stopImmediatePropagation();
    // e.preventDefault();
    const { x, y } = this.getCoordinates(e);
    const vx = x - this.dragLastPosition.x;
    const vy = y - this.dragLastPosition.y;
    this.wasMoved = true;
    this.handlers.onDrag({ vx, vy }, this.modifiers!, this.element!);
    this.dragLastPosition = { x, y };
  };

  private onMouseTouchUp = (e: CursorEvent) => {
    if (!this.dragLastPosition) return;
    // Prevent click event after drag
    if (this.wasMoved && (e instanceof MouseEvent || !e.touches)) {
      window.addEventListener('click', (e) => e.stopPropagation(), {
        capture: true,
        once: true
      });
    }
    this.handlers.onDragEnd(
      {
        x: this.dragLastPosition.x,
        y: this.dragLastPosition.y
      },
      this.modifiers!,
      this.element!
    );

    this.wasMoved = false;
    this.dragLastPosition = null;
    this.modifiers = null;
    this.element = null;
  };
}
