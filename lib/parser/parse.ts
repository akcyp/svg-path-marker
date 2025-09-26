import { Shape } from './core/Shape';
import { tokenizePath } from './tokenizer';

export const parsePath = (d: string) => {
  if (typeof d !== 'string') {
    throw new TypeError('Invalid type');
  }
  const shapes: Shape[] = [];
  let shape = new Shape({ x: 0, y: 0 });
  const addShape = (newShape: Shape) => {
    if (newShape.commands.length) {
      shapes.push(newShape);
      shape = new Shape(newShape.end);
    }
  };
  for (const token of tokenizePath(d)) {
    if (token.command === 'moveto') addShape(shape);
    shape.add(token);
    if (shape.closed) addShape(shape);
  }
  if (shape.commands.length) {
    shapes.push(shape);
  }
  return shapes;
};
