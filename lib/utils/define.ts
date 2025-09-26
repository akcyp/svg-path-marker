export const define = (name: string) => (constructor: CustomElementConstructor) => {
  customElements.define(name, constructor);
};
