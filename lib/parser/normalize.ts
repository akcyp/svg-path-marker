export type SVGPathToken = {
  relative: boolean;
} & (
  | { code: 'M'; command: 'moveto'; x: number; y: number }
  | { code: 'm'; command: 'moveto'; x: number; y: number }
  | { code: 'L'; command: 'lineto'; x: number; y: number }
  | { code: 'l'; command: 'lineto'; x: number; y: number }
  | { code: 'V'; command: 'vertical lineto'; y: number }
  | { code: 'v'; command: 'vertical lineto'; y: number }
  | { code: 'H'; command: 'horizontal lineto'; x: number }
  | { code: 'h'; command: 'horizontal lineto'; x: number }
  | {
      code: 'C';
      command: 'curveto';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x: number;
      y: number;
    }
  | {
      code: 'c';
      command: 'curveto';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x: number;
      y: number;
    }
  | { code: 'S'; command: 'smooth curveto'; x2: number; y2: number; x: number; y: number }
  | {
      code: 's';
      command: 'smooth curveto';
      x2: number;
      y2: number;
      x: number;
      y: number;
    }
  | { code: 'Q'; command: 'quadratic curveto'; x1: number; y1: number; x: number; y: number }
  | {
      code: 'q';
      command: 'quadratic curveto';
      x1: number;
      y1: number;
      x: number;
      y: number;
    }
  | { code: 'T'; command: 'smooth quadratic curveto'; x: number; y: number }
  | { code: 't'; command: 'smooth quadratic curveto'; x: number; y: number }
  | {
      code: 'A';
      command: 'elliptical arc';
      rx: number;
      ry: number;
      xAxisRotation: number;
      largeArc: boolean;
      sweep: boolean;
      x: number;
      y: number;
    }
  | {
      code: 'a';
      command: 'elliptical arc';
      rx: number;
      ry: number;
      xAxisRotation: number;
      largeArc: boolean;
      sweep: boolean;
      x: number;
      y: number;
    }
  | { code: 'Z'; command: 'closepath' }
  | { code: 'z'; command: 'closepath' }
);

export const normalize = (code: string, values: number[]): SVGPathToken => {
  const relative = code.toLowerCase() === code;
  switch (code) {
    case 'M':
    case 'm': {
      const [x, y] = values;
      return { relative, code, command: 'moveto', x, y };
    }
    case 'L':
    case 'l': {
      const [x, y] = values;
      return { relative, code, command: 'lineto', x, y };
    }
    case 'V':
    case 'v': {
      const [y] = values;
      return { relative, code, command: 'vertical lineto', y };
    }
    case 'H':
    case 'h': {
      const [x] = values;
      return { relative, code, command: 'horizontal lineto', x };
    }
    case 'C':
    case 'c': {
      const [x1, y1, x2, y2, x, y] = values;
      return { relative, code, command: 'curveto', x1, y1, x2, y2, x, y };
    }
    case 'S':
    case 's': {
      const [x2, y2, x, y] = values;
      return { relative, code, command: 'smooth curveto', x2, y2, x, y };
    }
    case 'Q':
    case 'q': {
      const [x1, y1, x, y] = values;
      return { relative, code, command: 'quadratic curveto', x1, y1, x, y };
    }
    case 'T':
    case 't': {
      const [x, y] = values;
      return { relative, code, command: 'smooth quadratic curveto', x, y };
    }
    case 'A':
    case 'a': {
      const [rx, ry, xAxisRotation, largeArc, sweep, x, y] = values;
      return {
        relative,
        code,
        command: 'elliptical arc',
        rx,
        ry,
        xAxisRotation,
        largeArc: !!largeArc,
        sweep: !!sweep,
        x,
        y
      };
    }
    case 'Z':
    case 'z': {
      return { relative, code, command: 'closepath' };
    }
  }
  throw new Error(`Failed to tokenize "${code} ${values}"`);
};
