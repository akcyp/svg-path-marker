import styles from './index.scss?inline';
import { WebComponentLifecycle } from '../../types/WebComponentLifecycle';
import { WebComponentsFormField } from '../../types/WebComponentsFormField';
import { define } from '../../utils/define';
import { parsePath } from '../../parser/parse';
import { Shape } from '../../parser/core/Shape';
import { Renderer } from '../../core/Renderer';
import { InteractionContext, Interactions } from '../../core/Interactions';
import { KeyboardAPI } from '~/lib/core/KeyboardAPI';
import { HistoryAPI, HistoryAPIContext } from '~/lib/core/HistoryAPI';
import { create } from '~/lib/utils/create';

export interface SVGPathMarkerProps {
  disabled: boolean | null;
  d: string | null;
  viewbox: string | null;
  precision: string | null;
  showhelpers: boolean | null;
}

@define('svg-path-marker')
export class SVGPathMarker
  extends HTMLElement
  implements WebComponentLifecycle, WebComponentsFormField
{
  static create(props: Partial<SVGPathMarkerProps>) {
    const element = document.createElement('svg-path-marker') as SVGPathMarker;
    Object.assign(element, props);
    return element;
  }
  static readonly formAssociated = true;
  static readonly observedAttributes: (keyof SVGPathMarkerProps)[] = [
    'disabled',
    'd',
    'viewbox',
    'precision',
    'showhelpers'
  ];

  /*
    get field() => this.getAttribute(field)
    set field() => this.setAttribute(field, ...)
    #fieldChanged() => side-effects
  */

  // Disabled property
  get disabled() {
    return this.hasAttribute('disabled');
  }
  set disabled(value) {
    this.toggleAttribute('disabled', !!value);
  }
  #disabledChange() {
    if (this.disabled) this.#interactions.controlsAPI.hide();
  }

  // ShowHelpers property
  get showhelpers() {
    return this.hasAttribute('showHelpers');
  }
  set showhelpers(value) {
    this.toggleAttribute('showHelpers', !!value);
  }
  #showHelpersChange() {
    this.#internals.states[this.showhelpers ? 'add' : 'delete']('helpers-default-visible');
  }

  // Precision property
  #isValidPrecision(value: string | null) {
    const precision = Number(value);
    return (
      precision &&
      !Number.isNaN(precision) &&
      Number.isInteger(precision) &&
      precision >= 0 &&
      precision <= 10
    );
  }
  get precision() {
    return this.getAttribute('precision');
  }
  set precision(value) {
    if (!this.#isValidPrecision(value)) {
      throw new TypeError(`Invalid precision provided. It should be an integer in range <0, 10>`);
    }
    this.setAttribute('precision', `${value}`);
  }
  #precisionChange() {
    if (this.#isValidPrecision(this.precision)) {
      this.#interactions.setPrecision(Number(this.precision));
    }
  }

  // ViewBox property
  #isValidViewbox(value: string | null) {
    return !value || /^(-?\d+(?:\.\d+)?\s){3}(-?\d+(?:\.\d+)?)$/.test(value);
  }
  get viewbox() {
    return this.getAttribute('viewBox');
  }
  set viewbox(value) {
    if (!this.#isValidViewbox(value)) {
      throw new TypeError(
        `Invalid viewbox value. It should be null / empty string or in format "{number} {number} {number} {number}"`
      );
    }
    if (value) {
      this.setAttribute('viewBox', value);
    } else {
      this.removeAttribute('viewBox');
    }
  }
  #viewBoxChange() {
    if (this.#isValidViewbox(this.viewbox)) {
      this.#history.clear();
      this.#renderer.update(this.#shapes, this.d ?? '', this.viewbox);
    }
  }

  // Path d property
  #shapes: Shape[] = [];
  #parsePathAndUpdateFormValue(value: string) {
    this.#internals.setFormValue(value);
    let shapes: Shape[] | null = null;
    try {
      shapes = parsePath(value);
      this.#internals.setValidity({
        typeMismatch: false,
        patternMismatch: false,
        badInput: false
      });
    } catch (e) {
      this.#internals.setValidity(
        {
          typeMismatch: e instanceof TypeError,
          patternMismatch: e instanceof SyntaxError,
          badInput: true
        },
        (e as Error).message
      );
    }
    return shapes;
  }
  get d() {
    return this.getAttribute('d');
  }
  set d(value) {
    this.setAttribute('d', value ?? '');
  }
  #dChange(oldValue: string, newValue: string) {
    if (oldValue?.replace(/\s+/g, ' ') === newValue?.replace(/\s+/g, ' ')) return;
    const shapes = this.#parsePathAndUpdateFormValue(newValue);
    const event = new InputEvent('change', {
      data: newValue,
      cancelable: true
    });
    this.dispatchEvent(event);
    if (event.defaultPrevented || !shapes) {
      return;
    }
    this.#shapes = shapes;
    // Update renderer, interactions, keyboard APIs
    this.#onPathUpdate();
    // Complete event
    if (!this.#internals.states.has('drag')) {
      this.#onPathComplete();
    }
  }

  readonly #shadow: ShadowRoot;
  readonly #internals: ElementInternals;
  #svg!: SVGSVGElement;
  #tooltip!: HTMLDivElement;
  #renderer!: Renderer;
  #interactions!: Interactions;
  #keyboard!: KeyboardAPI;
  #history!: HistoryAPI;
  #connected = false;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#shadow = this.attachShadow({ mode: 'open' });
  }

  #onPathComplete() {
    // Update history API
    this.#history.update(this.#shapes);
    const completeEvent = new InputEvent('complete', {
      data: this.d,
      cancelable: false
    });
    this.dispatchEvent(completeEvent);
  }

  #onPathUpdate() {
    const isClosed = this.#shapes.every((shape) => shape.closed);
    this.#internals.states[isClosed ? 'add' : 'delete']('closed');
    this.#internals.states[isClosed ? 'delete' : 'add']('open');

    this.#renderer.update(this.#shapes, this.d ?? '', this.viewbox);
    this.#interactions.update(this.#shapes);
    this.#keyboard.update(this.#shapes);
  }

  #interactionContext: InteractionContext = {
    setState: (state, value) => {
      this.#internals.states[value ? 'add' : 'delete'](state);
    },
    updateShapes: (shapes) => {
      this.d = shapes.map((shape) => shape.toString()).join(' ');
    }
  };

  #historyContext: HistoryAPIContext = {
    updateD: (d: string) => {
      this.d = d;
    }
  };

  connectedCallback() {
    this.#connected = true;
    this.#svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.#tooltip = create('div', { className: 'popup' });
    this.#shadow.appendChild(
      create('div', { className: 'wrapper' }, [this.#svg, this.#tooltip, create('slot')])
    );
    // Attach styles
    this.#shadow.appendChild(create('style', { innerHTML: styles }));

    this.#renderer = new Renderer(this.#svg);
    this.#interactions = new Interactions(this.#svg, this.#tooltip, this.#interactionContext);
    this.#keyboard = new KeyboardAPI(this, this.#interactions.controlsAPI);
    this.#history = new HistoryAPI(this, 50, this.#historyContext);

    this.#interactions.init();
    this.#keyboard.init();
    this.#history.init();

    // Call change handlers to set initial state
    this.#disabledChange();
    this.#precisionChange();
    this.#viewBoxChange();
    this.#showHelpersChange();
    this.#dChange('', this.d ?? '');
  }

  disconnectedCallback() {
    this.#connected = false;
    this.#interactions.destroy();
    this.#keyboard.destroy();
    this.#history.destroy();

    while (this.#shadow.firstChild) {
      this.#shadow.removeChild(this.#shadow.firstChild);
    }
  }

  attributeChangedCallback(name: keyof SVGPathMarkerProps, oldValue: string, newValue: string) {
    if (!this.#connected) return;
    switch (name) {
      case 'disabled':
        return this.#disabledChange();
      case 'd':
        return this.#dChange(oldValue, newValue);
      case 'viewbox':
        return this.#viewBoxChange();
      case 'showhelpers':
        return this.#showHelpersChange();
      case 'precision':
        return this.#precisionChange();
    }
  }

  // Forms
  get form() {
    return this.#internals.form;
  }
  get name() {
    return this.getAttribute('name');
  }
  get type() {
    return this.localName;
  }
  get validity() {
    return this.#internals.validity;
  }
  get validationMessage() {
    return this.#internals.validationMessage;
  }
  get willValidate() {
    return this.#internals.willValidate;
  }
  checkValidity() {
    return this.#internals.checkValidity();
  }
  reportValidity() {
    return this.#internals.reportValidity();
  }
  // formAssociatedCallback(form: HTMLFormElement) { this.#form = form; }
  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }
  formResetCallback() {
    this.d = '';
  }
  formStateRestoreCallback(state: string, _mode: 'restore' | 'autocomplete') {
    this.d = state;
  }
}
