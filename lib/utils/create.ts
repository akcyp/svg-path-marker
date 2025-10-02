export const create = <
  T extends keyof HTMLElementTagNameMap,
  P extends Partial<HTMLElementTagNameMap[T]>
>(
  tag: T,
  props?: P,
  childNodes?: Node[]
) => {
  const result = Object.assign(document.createElement(tag), props);
  if (childNodes) result.append(...childNodes);
  return result;
};
