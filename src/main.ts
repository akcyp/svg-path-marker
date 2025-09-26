import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './style.css';

import 'svg-path-marker';
import type { SVGPathMarker } from 'svg-path-marker';
import { createEditor } from './components/Editor';

const marker = document.querySelector('svg-path-marker') as SVGPathMarker;
const editorWrapper = document.querySelector('#editor-wrapper')!;
const disabledToggle = document.querySelector('#disabled-toggle') as HTMLInputElement;
const mouseCoords = document.querySelector('#mouse-coordinates')!;
const errorsWrapper = document.querySelector('#errors')!;

const updateMouseCoordinates = (event: MouseEvent | TouchEvent | null) => {
  if (!event) {
    mouseCoords.innerHTML = `(x, y)`;
    return;
  }
  const { left, top } = (event.currentTarget as SVGPathMarker).getBoundingClientRect();
  const pageX = 'touches' in event ? event.touches[0].pageX : event.pageX;
  const pageY = 'touches' in event ? event.touches[0].pageY : event.pageY;
  const x = Math.round(pageX - left);
  const y = Math.round(pageY - top);
  mouseCoords.innerHTML = `(${x}, ${y})`;
};

marker.addEventListener('mousemove', (e) => updateMouseCoordinates(e), true);
marker.addEventListener('touchmove', (e) => updateMouseCoordinates(e), true);
marker.addEventListener('mouseleave', () => updateMouseCoordinates(null), true);
marker.addEventListener('touchend', () => updateMouseCoordinates(null), true);

const displayErrors = () => {
  const {
    badInput,
    customError,
    patternMismatch,
    rangeOverflow,
    rangeUnderflow,
    stepMismatch,
    tooLong,
    tooShort,
    typeMismatch,
    valid,
    valueMissing
  } = marker.validity;
  const entries = [
    ...Object.entries({
      badInput,
      customError,
      patternMismatch,
      rangeOverflow,
      rangeUnderflow,
      stepMismatch,
      tooLong,
      tooShort,
      typeMismatch,
      valid,
      valueMissing
    }),
    ['message', marker.validationMessage]
  ];
  const errors = Object.fromEntries(entries.filter(([, value]) => !!value));
  errorsWrapper.innerHTML = 'Input validity: ' + JSON.stringify(errors);
};

// Controls
disabledToggle.addEventListener('change', () => {
  marker.disabled = disabledToggle.checked;
});

const editor = createEditor({
  parent: editorWrapper,
  onChange: (update) => {
    if (!update.docChanged) return;
    const d = update.view.state.doc.toString().replace(/\n/g, ' ');
    marker.d = d;
  },
  initialValue: ''
});

const formatPath = (d: string) =>
  d.replace(/([MLVHCSAQTZ](?:(?:[\s,]-?\d+(?:\.\d+)?)*))(\s|$)/gi, '$1\n');

displayErrors();
marker.addEventListener('change', () => {
  const doc = formatPath(marker.d ?? '');
  displayErrors();
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: doc
    },
    selection: {
      anchor: editor.state.selection.ranges?.[0].anchor,
      head: editor.state.selection.ranges?.[0].head
    }
  });
});

const form = document.querySelector('form')!;
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  alert(JSON.stringify(Object.fromEntries(formData)));
});

const examples: Record<string, string> = {
  none: '',
  heart: '',
  relatives: '',
  arcs: '',
  curves: ''
};
const selector = document.querySelector('#selector') as HTMLSelectElement;
selector.addEventListener('change', () => {
  marker.d = examples[selector.value]!;
});

const viewboxSelector = document.querySelector('#viewbox-select') as HTMLSelectElement;
viewboxSelector.addEventListener('change', () => {
  marker.viewBox = viewboxSelector.value;
});
