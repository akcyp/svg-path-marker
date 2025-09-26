export interface WebComponentLifecycle {
  /**
   * Called each time the element is added to the document.
   * The specification recommends that, as far as possible, developers should implement custom element setup in this callback rather than the constructor.
   */
  connectedCallback?(): void;
  /**
   * Called each time the element is removed from the document.
   */
  disconnectedCallback?(): void;
  /**
   * Called each time the element is moved to a new document.
   */
  adoptedCallback?(): void;
  /**
   * Called when attributes are changed, added, removed, or replaced.
   * See Responding to attribute changes for more details about this callback.
   */
  attributeChangedCallback?(attr: string, oldValue: string, newValue: string): void;
}
