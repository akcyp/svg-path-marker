export interface WebComponentsFormField {
  // The following properties and methods aren't strictly required,
  // but browser-level form controls provide them. Providing them helps
  // ensure consistency with browser-provided controls.
  get form(): HTMLFormElement | null;
  get name(): string | null;
  get type(): string;
  get validity(): ValidityState;
  get validationMessage(): string;
  get willValidate(): boolean;

  checkValidity(): boolean;
  reportValidity(): boolean;

  /**
   * Called when the browser associates the element with a form element, or disassociates the element from a form element.
   */
  formAssociatedCallback?(form: HTMLFormElement): void;

  /**
   * Called after the disabled state of the element changes, either because the disabled attribute of this element was added or removed;
   * or because the disabled state changed on a <fieldset> that's an ancestor of this element.
   * The disabled parameter represents the new disabled state of the element.
   * The element may, for example, disable elements in its shadow DOM when it is disabled.
   */
  formDisabledCallback?(disabled: boolean): void;

  /**
   * Called after the form is reset. The element should reset itself to some kind of default state.
   * For <input> elements, this usually involves setting the value property to match the value attribute
   * set in markup (or in the case of a checkbox, setting the checked property to match the checked attribute.
   */
  formResetCallback?(): void;

  /**
   * Called in one of two circumstances:
   * - When the browser restores the state of the element (for example, after a navigation, or when the browser restarts).
   * - When the browser's input-assist features such as form autofilling sets a value.
   */
  formStateRestoreCallback?(state: string, mode: 'restore' | 'autocomplete'): void;
}
