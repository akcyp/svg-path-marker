import { Shape } from '../parser/core/Shape';
import { SVGPathToken } from '../parser/normalize';
import type { ControlsAPI } from './ControlsAPI';

export class KeyboardAPI {
  private tabIndex = -1;
  private shapes: Shape[] = [];

  constructor(
    private self: HTMLElement,
    private controlsAPI: ControlsAPI
  ) {}

  public update(shapes: Shape[]) {
    this.shapes = shapes;
  }

  public init() {
    this.self.setAttribute('tabindex', '0');
    this.self.addEventListener('keydown', this.onKeydown);
  }

  public destroy() {
    this.self.removeEventListener('keydown', this.onKeydown);
  }

  private getCommandFromIndex(index: number) {
    if (index < 0) return null;
    let count = 0;
    for (const shape of this.shapes) {
      for (const command of shape.commands) {
        if (count === index) {
          return { shape, command };
        }
        count++;
      }
    }
    return null;
  }

  private onKeydown = (e: KeyboardEvent) => {
    const controlsAPI = this.controlsAPI;
    if (e.code === 'Escape') {
      controlsAPI.hide();
      return;
    }
    if (e.code === 'Tab') {
      this.tabIndex += e.shiftKey ? -1 : 1;
      this.tabIndex = Math.max(this.tabIndex, -1);
      const result = this.getCommandFromIndex(this.tabIndex);
      if (result) {
        const shapeIndex = this.shapes.indexOf(result.shape);
        const commandIndex = result.shape.commands.indexOf(result.command);
        controlsAPI.show('operation', `shape-${shapeIndex}-c-${commandIndex}`);
        e.preventDefault();
      } else {
        controlsAPI.hide();
        this.tabIndex = -1;
      }
      return;
    }
    const context = controlsAPI.getActionsContext();
    if (!context) return;
    const actions = controlsAPI.getActions(context);
    if (controlsAPI.mode === 'add') {
      const types: Record<string, SVGPathToken['code']> = {
        KeyM: 'M',
        KeyL: 'L',
        KeyV: 'V',
        KeyH: 'H',
        KeyC: 'C',
        KeyS: 'S',
        KeyA: 'A',
        KeyQ: 'Q',
        KeyT: 'T'
      };
      const type = types[e.code];
      if (actions.addCommand.visible && !actions.addCommand.disabled && type) {
        actions.addCommand.action(type);
      }
      return;
    }
    if (controlsAPI.mode === 'operation') {
      const keyToActions: Record<
        string,
        {
          visible: boolean;
          disabled: boolean;
          action: () => void;
        }
      > = {
        KeyL: actions.togglePathClosed,
        Space: actions.togglePathClosed,
        KeyA: actions.useAddMode,
        Equal: actions.useAddMode,
        KeyD: actions.deleteCommand,
        Delete: actions.deleteCommand,
        KeyH: actions.toggleHelperPointsVisible,
        KeyS: actions.toggleSweep,
        KeyC: actions.toggleLargeArc,
        KeyR: actions.changeRotation
      };
      const action = keyToActions[e.code];
      if (action && action.visible && !action.disabled) {
        action.action();
      } else if (!actions.move.disabled) {
        switch (e.code) {
          case 'ArrowLeft': {
            actions.move.action({ vx: -1, vy: 0 });
            break;
          }
          case 'ArrowRight': {
            actions.move.action({ vx: 1, vy: 0 });
            break;
          }
          case 'ArrowUp': {
            actions.move.action({ vx: 0, vy: -1 });
            break;
          }
          case 'ArrowDown': {
            actions.move.action({ vx: 0, vy: 1 });
            break;
          }
        }
      }
    }
  };
}
