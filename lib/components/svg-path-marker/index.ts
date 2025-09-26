import styles from './index.scss?inline';
import { WebComponentLifecycle } from '../../types/WebComponentLifecycle';
import { WebComponentsFormField } from '../../types/WebComponentsFormField';
import { define } from '../../utils/define';
import { parsePath } from '../../parser/parse';
import { Shape } from '../../parser/core/Shape';
import { Renderer } from '../../core/Renderer';
import { Interactions } from '../../core/Interactions';
import { KeyboardAPI } from '~/lib/core/KeyboardAPI';
import { HistoryAPI } from '~/lib/core/HistoryAPI';

export interface SVGPathMarkerProps {
  disabled: boolean | null;
  d: string | null;
  viewBox: string | null;
}

@define('svg-path-marker')
export class SVGPathMarker
  extends HTMLElement
  implements WebComponentLifecycle, WebComponentsFormField
{
  static readonly formAssociated = true;
  static readonly observedAttributes: (keyof SVGPathMarkerProps)[] = ['disabled', 'd', 'viewBox'];

  // Disabled property
  get disabled() {
    return this.hasAttribute('disabled');
  }
  set disabled(value) {
    this.toggleAttribute('disabled', !!value);
  }
  #disabledChange(_: boolean, newValue: boolean) {
    this.disabled = newValue;
    if (newValue) this.#interactions.controlsAPI.hide();
  }

  // ViewBox property
  get viewBox() {
    return this.getAttribute('viewBox');
  }
  set viewBox(value) {
    if (!value || !/^(-?\d+(?:\.\d+)?\s){3}(-?\d+(?:\.\d+)?)$/.test(value)) return;
    if (value) {
      this.setAttribute('viewBox', value);
    } else {
      this.removeAttribute('viewBox');
    }
    this.#history.clear();
    this.#renderer.update(this.#shapes, this.d ?? '', this.viewBox);
  }
  #viewBoxChange(_: string, newValue: string | null) {
    this.viewBox = newValue;
  }

  // Path d property
  #shapes: Shape[] = [];
  get d() {
    return this.getAttribute('d');
  }
  set d(value) {
    this.setAttribute('d', value ?? '');
  }
  #dChange(oldValue: string, newValue: string) {
    if (oldValue?.replace(/\s+/g, ' ') === newValue?.replace(/\s+/g, ' ')) return;
    try {
      this.#shapes = parsePath(newValue);
    } catch (e) {
      this.#internals.setValidity(
        {
          typeMismatch: e instanceof TypeError,
          patternMismatch: e instanceof SyntaxError,
          badInput: true
        },
        (e as Error).message
      );
      return;
    }
    this.#internals.setFormValue(newValue);
    this.#internals.setValidity({
      typeMismatch: false,
      patternMismatch: false,
      badInput: false
    });
    this.#onPathUpdate();
    this.#renderer.update(this.#shapes, newValue, this.viewBox);
    this.#interactions.update(this.#shapes);
    this.#keyboard.update(this.#shapes);
    const event = new InputEvent('change', {
      data: this.d,
      cancelable: false
    });
    this.dispatchEvent(event);
    if (!this.#internals.states.has('drag')) {
      this.#history.update(this.#shapes, newValue);
      const completeEvent = new InputEvent('complete', {
        data: this.d,
        cancelable: false
      });
      this.dispatchEvent(completeEvent);
    }
  }

  readonly #shadow: ShadowRoot;
  readonly #internals: ElementInternals;
  readonly #svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  readonly #tooltip = Object.assign(document.createElement('div'), { className: 'popup' });
  readonly #renderer = new Renderer(this.#svg);
  readonly #interactions = new Interactions(this.#svg, this.#tooltip, {
    setState: (state, value) => {
      this.#internals.states[value ? 'add' : 'delete'](state);
    },
    updateShapes: (shapes) => {
      this.d = shapes.map((shape) => shape.toString()).join(' ');
    }
  });
  readonly #keyboard = new KeyboardAPI(this, this.#interactions.controlsAPI);
  readonly #history = new HistoryAPI(this, 50, {
    updateD: (d) => {
      this.d = d;
    }
  });

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(Object.assign(document.createElement('style'), { innerHTML: styles }));
    const wrapper = Object.assign(document.createElement('div'), { className: 'wrapper' });
    wrapper.appendChild(this.#svg);
    wrapper.appendChild(this.#tooltip);
    wrapper.appendChild(document.createElement('slot'));
    this.#shadow.appendChild(wrapper);
    this.setAttribute('tabindex', '0');
  }

  #onPathUpdate() {
    const isClosed = this.#shapes.every((shape) => shape.closed);
    this.#internals.states[isClosed ? 'add' : 'delete']('closed');
    this.#internals.states[isClosed ? 'delete' : 'add']('open');
  }

  connectedCallback() {
    this.#interactions.init();
    this.#keyboard.init();
    this.#history.init();
  }

  disconnectedCallback() {
    this.#interactions.destroy();
    this.#keyboard.destroy();
    this.#history.destroy();
  }

  attributeChangedCallback(name: keyof SVGPathMarkerProps, oldValue: string, newValue: string) {
    switch (name) {
      case 'disabled':
        return this.#disabledChange(oldValue !== null, newValue !== null);
      case 'd':
        return this.#dChange(oldValue, newValue);
      case 'viewBox':
        return this.#viewBoxChange(oldValue, newValue);
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
