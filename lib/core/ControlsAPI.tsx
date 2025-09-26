import {
  jsx,
  attributesModule,
  datasetModule,
  init,
  propsModule,
  toVNode,
  VNode,
  eventListenersModule
} from 'snabbdom';
import type { SVGPathToken } from '../parser/normalize';
import type { Shape } from '../parser/core/Shape';
import type { MoveOptions, OneOfShapeCommand } from '../parser/core/ShapeCommand';
import { jsxDomPropsModule } from 'snabbdom-transform-jsx-props';
import { createCommandSuccessor } from '../utils/createCommandSuccessor';
import { cx } from '../utils/cx';
import { getFigureFromKey, getTargetFromEvent } from './domHelpers';

import trashIcon from '../icons/trash.svg';
import addIcon from '../icons/add.svg';
import rotateIcon from '../icons/rotate.svg';
import arcSegIcon from '../icons/arc-seg.svg';
import compassIcon from '../icons/compass2.svg';
import eyeIcon from '../icons/eye2.svg';
import closedLockIcon from '../icons/closed.svg';
import openLockIcon from '../icons/open.svg';
import { getBorderPoints } from '../utils/getBorderPoints';

const helpersVisibleKey = 'data-helpers-visible';
const patcher = init([
  jsxDomPropsModule,
  datasetModule,
  propsModule,
  attributesModule,
  eventListenersModule
]);

type ControlPopupMode = 'closed' | 'operation' | 'add';
interface ActionContext {
  element: SVGElement;
  key: string;
  shape: Shape;
  command: OneOfShapeCommand;
}

interface ControlsAPIContext {
  updateShapes: (shapes: Shape[]) => void;
}

export class ControlsAPI {
  mode: ControlPopupMode = 'closed';
  selectedKey?: string;

  private vnode: VNode;
  private shapes: Shape[] = [];
  constructor(
    private svg: SVGSVGElement,
    private tooltip: HTMLDivElement,
    private context: ControlsAPIContext
  ) {
    const controlsContent = document.createElement('div');
    tooltip.appendChild(controlsContent);
    this.vnode = patcher(toVNode(controlsContent), this.render());
  }

  public register() {
    this.svg.addEventListener('click', this.onClick);
  }

  public destroy() {
    this.svg.removeEventListener('click', this.onClick);
  }

  public update(shapes: Shape[] = this.shapes) {
    this.shapes = shapes;
    this.vnode = patcher(this.vnode, this.render());
    if (this.mode === 'closed') {
      this.tooltip.style.display = 'none';
      this.clearHighlight();
    } else {
      this.tooltip.style.display = '';
      this.addHighlight();
    }
  }

  public show(mode: ControlPopupMode, key: string) {
    this.mode = mode;
    this.selectedKey = key;
    this.update();
  }

  public hide() {
    this.mode = 'closed';
    this.selectedKey = undefined;
    this.svg.querySelector('.selected')?.classList.remove('selected');
    this.update();
  }

  public onClick = (e: MouseEvent | TouchEvent) => {
    this.hide();
    const { target, key } = getTargetFromEvent(e);
    if (!target) {
      return;
    }
    this.show('operation', key);
  };

  private getSelectedElement() {
    return this.svg.querySelector(`[data-key="${this.selectedKey}"]`) as SVGElement | null;
  }

  private clearHighlight() {
    this.svg.querySelector('.selected')?.classList.remove('selected');
  }

  private addHighlight() {
    this.getSelectedElement()?.classList.add('selected');
  }

  private updateTooltipPosition(left: number, top: number) {
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  public getActions = ({ shape, command, element }: ActionContext) =>
    ({
      togglePathClosed: {
        visible: command.command === 'moveto',
        disabled: false,
        action: () => {
          shape.toggleClose();
          this.context.updateShapes(this.shapes);
        }
      },
      useAddMode: {
        visible: true,
        disabled: command.command === 'closepath',
        action: () => {
          this.mode = 'add';
          this.update();
        }
      },
      addCommand: {
        visible: this.mode === 'add',
        disabled: false,
        action: (type: SVGPathToken['code']) => {
          const border = getBorderPoints(this.svg);
          let successor = createCommandSuccessor(command, type, { vx: 10, vy: 10 });
          if (!successor.isInsideBorder(border)) {
            successor = createCommandSuccessor(command, type, { vx: -10, vy: -10 });
          }
          shape.insertAfter(command, successor);
          this.hide();
          this.context.updateShapes(this.shapes);
        }
      },
      deleteCommand: {
        visible: true,
        disabled: command.command === 'moveto' && shape.commands.length > 1,
        action: () => {
          shape.remove(command);
          // Remove entire shape if only close path command left
          if (shape.commands.every((cmd) => cmd.command === 'closepath')) {
            this.shapes.splice(this.shapes.indexOf(shape), 1);
          }
          this.hide();
          this.context.updateShapes(this.shapes);
        }
      },
      toggleHelperPointsVisible: {
        visible: 'helperCoords' in command,
        disabled: false,
        active: element.hasAttribute(helpersVisibleKey),
        action: () => {
          const helpersVisible = element.hasAttribute(helpersVisibleKey);
          if (helpersVisible) element.removeAttribute(helpersVisibleKey);
          else element.setAttribute(helpersVisibleKey, 'true');
          this.update();
        }
      },
      toggleSweep: {
        visible: command.command === 'elliptical arc',
        disabled: false,
        active: command.command === 'elliptical arc' && command.sweep,
        action: () => {
          if (command.command !== 'elliptical arc')
            throw new Error('Failed to execute command action');
          command.toggleSweep();
          this.context.updateShapes(this.shapes);
        }
      },
      toggleLargeArc: {
        visible: command.command === 'elliptical arc',
        disabled: false,
        active: command.command === 'elliptical arc' && command.largeArc,
        action: () => {
          if (command.command !== 'elliptical arc')
            throw new Error('Failed to execute command action');
          command.toggleLargeArc();
          this.context.updateShapes(this.shapes);
        }
      },
      changeRotation: {
        visible: command.command === 'elliptical arc',
        disabled: false,
        rotation: command.command === 'elliptical arc' ? command.xAxisRotation : 0,
        action: () => {
          if (command.command !== 'elliptical arc')
            throw new Error('Failed to execute command action');
          command.setXAxisRotation((command.xAxisRotation + 5) % 360);
          this.context.updateShapes(this.shapes);
        }
      },
      move: {
        visible: false,
        disabled: false,
        action: ({ vx, vy }: MoveOptions) => {
          command.move({ vx, vy, moveRelative: true });
          this.context.updateShapes(this.shapes);
        }
      }
    }) satisfies Record<
      string,
      {
        visible: boolean;
        disabled: boolean;
        action: (...args: any[]) => void;
        // Command specific
        active?: boolean;
        rotation?: number;
      }
    >;

  public getActionsContext(): ActionContext | null {
    const selectedElement = this.getSelectedElement();
    const { command, shape } = getFigureFromKey(this.shapes, this.selectedKey ?? '');
    if (!selectedElement || !command || !shape) return null;
    return {
      element: selectedElement,
      key: this.selectedKey!,
      shape,
      command
    };
  }

  private render() {
    if (this.mode === 'closed') return <ul />;
    const context = this.getActionsContext();
    if (!context) {
      this.mode = 'closed';
      return <ul />;
    }

    const { element, command, shape } = context;
    // Fix moveto tooltip invalid position
    // First child is usually a path fragment, last is the circle.
    const sizingTargetElement = command.command === 'moveto' ? element.lastElementChild! : element;
    const rect = sizingTargetElement.getBoundingClientRect();
    this.updateTooltipPosition(rect.left + rect.width / 2, rect.top);

    const actions = this.getActions(context);

    if (this.mode === 'add') {
      const allCommandTypes = ['M', 'L', 'V', 'H', 'C', 'S', 'A', 'Q', 'T'] as const;
      return (
        <ul>
          {allCommandTypes.map((key) => (
            <li key={`add-${key}`} on={{ click: () => actions.addCommand.action(key) }}>
              {key}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul>
        <li key="code" data-tooltip={command.toString()}>
          {command.code}
        </li>
        {actions.togglePathClosed.visible && (
          <li
            key="togglePathClosed"
            data-tooltip="Open / close path"
            classNames={cx({ active: shape.closed })}
            on={{ click: actions.togglePathClosed.action }}
          >
            <img src={shape.closed ? closedLockIcon : openLockIcon} />
          </li>
        )}
        {actions.toggleHelperPointsVisible.visible && (
          <li
            key="helper"
            data-tooltip="Show helper points"
            className={cx({ active: actions.toggleHelperPointsVisible.active })}
            on={{ click: actions.toggleHelperPointsVisible.action }}
          >
            <img src={eyeIcon} />
          </li>
        )}
        {actions.toggleSweep.visible && (
          <li
            key="sweep"
            data-tooltip="Sweep flag"
            className={cx({ active: actions.toggleSweep.active })}
            on={{ click: actions.toggleSweep.action }}
          >
            <img src={rotateIcon} />
          </li>
        )}
        {actions.toggleLargeArc.visible && (
          <li
            key="largearc"
            data-tooltip="Large arc flag"
            className={cx({ active: actions.toggleLargeArc.active })}
            on={{ click: actions.toggleLargeArc.action }}
          >
            <img src={arcSegIcon} />
          </li>
        )}
        {actions.changeRotation.visible && (
          <li
            key="rotation"
            data-tooltip={`X axis rotation: ${actions.changeRotation.rotation}deg`}
            on={{ click: actions.changeRotation.action }}
          >
            <img
              src={compassIcon}
              style={{ transform: `rotate(${actions.changeRotation.rotation}deg)` }}
            />
          </li>
        )}
        {actions.deleteCommand.visible && (
          <li
            key="delete"
            data-tooltip="Delete point"
            className={cx({ disabled: actions.deleteCommand.disabled })}
            on={{ click: actions.deleteCommand.action }}
          >
            <img src={trashIcon} />
          </li>
        )}
        {actions.useAddMode.visible && (
          <li
            key="add"
            className={cx({ disabled: actions.useAddMode.disabled })}
            on={{ click: actions.useAddMode.action }}
            data-tooltip="Add new point"
          >
            <img src={addIcon} />
          </li>
        )}
      </ul>
    );
  }
}
