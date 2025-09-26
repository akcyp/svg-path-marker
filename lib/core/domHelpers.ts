import type { Shape } from '../parser/core/Shape';
import type { OneOfShapeCommand } from '../parser/core/ShapeCommand';

const KEY_ATTR = 'data-key';
const TYPE_ATTR = 'data-type';

const hasKey = (element?: Element | null) => element?.hasAttribute(KEY_ATTR) ?? false;
const getKey = (element?: Element | null) => element?.getAttribute(KEY_ATTR) ?? null;

const hasType = (element?: Element | null) => element?.hasAttribute(TYPE_ATTR) ?? false;
const getType = (element?: Element | null) => element?.getAttribute(TYPE_ATTR) ?? null;

export const getFigureFromKey = (shapes: Shape[], key: string) => {
  const result: Partial<{
    shape: Shape;
    command: OneOfShapeCommand;
  }> = {};
  if (!key.startsWith('shape-')) return result;
  const match = key.match(/^shape-(\d+)(?:-c-(\d+))?$/);
  if (!match) return result;
  const [_, shapeIndex, commandIndex] = match;
  result.shape = shapes[+shapeIndex];
  result.command =
    typeof commandIndex === 'string' ? result.shape.commands[+commandIndex] : undefined;
  return result;
};

export const getFigureFromTarget = (
  shapes: Shape[],
  element: SVGElement,
  options: { fragmentsAsPath?: boolean } = {}
) => {
  const key = getKey(element) ?? getKey(element.parentElement) ?? '';
  if (getType(element) === 'path-fragment' && options.fragmentsAsPath) {
    return { shape: getFigureFromKey(shapes, key).shape };
  }
  return getFigureFromKey(shapes, key);
};

export const isDraggableElement = (element: SVGElement) => {
  return hasType(element) && hasKey(element.parentElement);
};

export const isInteractiveElement = (element: SVGElement) => {
  return (
    hasType(element) &&
    hasKey(element.parentElement) &&
    ['end', 'path-fragment'].includes(getType(element) ?? '')
  );
};

export const getTargetFromEvent = (e: MouseEvent | TouchEvent) => {
  const [target] = e.composedPath();
  if (!target || !(target instanceof SVGElement) || !isInteractiveElement(target)) {
    return {
      target: null,
      key: ''
    };
  }
  return {
    target,
    key: getKey(target.parentElement)!
  };
};
