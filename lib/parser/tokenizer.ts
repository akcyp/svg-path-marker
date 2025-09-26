import { normalize, type SVGPathToken } from './normalize';

const validCommand = /^[\t\n\f\r\s]*([achlmqstvz])[\t\n\f\r\s]*/i;
const validFlag = /^[01]/;
const validCoordinate = /^[+-]?((\d*\.\d+)|(\d+\.)|(\d+))(e[+-]?\d+)?/i;
const validComma = /^(([\t\n\f\r\s]+,?[\t\n\f\r\s]*)|(,[\t\n\f\r\s]*))/;

const pathGrammar: Record<string, RegExp[]> = {
  z: [],
  h: [validCoordinate],
  v: [validCoordinate],
  m: [validCoordinate, validCoordinate],
  l: [validCoordinate, validCoordinate],
  t: [validCoordinate, validCoordinate],
  s: [validCoordinate, validCoordinate, validCoordinate, validCoordinate],
  q: [validCoordinate, validCoordinate, validCoordinate, validCoordinate],
  c: [
    validCoordinate,
    validCoordinate,
    validCoordinate,
    validCoordinate,
    validCoordinate,
    validCoordinate
  ],
  a: [
    validCoordinate,
    validCoordinate,
    validCoordinate,
    validFlag,
    validFlag,
    validCoordinate,
    validCoordinate
  ]
};

const matchPattern = (
  path: string,
  cursor: number,
  pattern: RegExp,
  expected: string
): [RegExpMatchArray, number] => {
  if (cursor > path.length) {
    throw new SyntaxError(`Invalid path at ${cursor}: expected ${expected}, received EOL`);
  }
  const result = path.slice(cursor).match(pattern);
  if (!result) {
    throw new SyntaxError(`Invalid path at ${cursor}: expected ${expected}`);
  }
  cursor += result[0].length;
  return [result, cursor];
};

export const tokenizeCommand = (path: string, cursor = 0): [SVGPathToken, number] => {
  const match = (pattern: RegExp, expected: string) => {
    const [res, c] = matchPattern(path, cursor, pattern, expected);
    cursor = c;
    return res;
  };
  // Parse command header
  const [_, type] = match(validCommand, 'command');
  const values = [] as number[];
  // Parse command parameters
  const syntax = pathGrammar[type.toLowerCase()];
  for (const [index, regex] of syntax.entries()) {
    // Parse separator
    if (index > 0) {
      match(validComma, 'separator');
    }
    // Parse single parameter
    const [factor] = match(regex, 'parameter');
    values.push(parseFloat(factor));
  }
  return [normalize(type, values), cursor];
};

export function* tokenizePath(d: string): Generator<SVGPathToken> {
  let cursor = 0;
  const path = d.trim();

  while (cursor < path.length) {
    // Parse command
    const [token, c] = tokenizeCommand(path, cursor);
    cursor = c;
    yield token;
  }
}
