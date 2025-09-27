import heart from './heart.txt?raw';
import relatives from './relatives.txt?raw';
import curves from './curves.txt?raw';
import arcs from './arcs.txt?raw';

export const examples: Record<string, { viewBox: string; d: string; showHelpers: boolean }> = {
  none: {
    viewBox: '',
    d: '',
    showHelpers: false
  },
  heart: {
    viewBox: '0 0 400 400',
    d: heart,
    showHelpers: true
  },
  relatives: {
    viewBox: '0 0 400 400',
    d: relatives,
    showHelpers: true
  },
  curves: {
    viewBox: '0 0 500 500',
    d: curves,
    showHelpers: true
  },
  arcs: {
    viewBox: '0 0 500 500',
    d: arcs,
    showHelpers: true
  }
};
